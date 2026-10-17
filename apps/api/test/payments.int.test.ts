import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type {
  ChargeRequest,
  ChargeResult,
  PaymentProvider,
} from '../src/orders/payment-provider.js';
import {
  makeCategory,
  makeProduct,
  signUp,
  startContext,
  type Fixture,
  type Session,
  type TestContext,
} from './helpers.js';

/** A gateway whose behaviour each test scripts. */
class ScriptedProvider implements PaymentProvider {
  readonly name = 'scripted';
  next: (request: ChargeRequest) => Promise<ChargeResult> = async (r) => ({
    status: 'succeeded',
    providerRef: `ref_${r.reference}`,
  });
  async charge(request: ChargeRequest): Promise<ChargeResult> {
    return this.next(request);
  }
}

const provider = new ScriptedProvider();
let ctx: TestContext;
let manager: Session;
let fixture: Fixture;

beforeAll(async () => {
  ctx = await startContext(provider);
  manager = await signUp(ctx, 'manager');
  fixture = await makeCategory(ctx, manager);
});
afterAll(async () => {
  await ctx.close();
});

async function placeOrder() {
  const user = await signUp(ctx);
  const p = await makeProduct(ctx, manager, fixture, { stock: 5, priceMinor: 7_500 });
  await ctx.http().put(`/api/v1/cart/items/${p.id}`).set(user.auth).send({ quantity: 1 });
  const order = (await ctx.http().post('/api/v1/orders').set(user.auth).send({})).body;
  return { user, order };
}
const pay = (user: Session, orderId: string) =>
  ctx.http().post(`/api/v1/orders/${orderId}/payments`).set(user.auth).send({ method: 'card' });

describe('payment outcomes', () => {
  it('keeps a declined payment on record, leaves the order payable and allows a retry', async () => {
    const { user, order } = await placeOrder();
    provider.next = async (r) => ({ status: 'failed', providerRef: `declined_${r.reference}` });
    const declined = await pay(user, order.id);
    expect(declined.status).toBe(402);
    expect(declined.body.code).toBe('payment-declined');
    expect(declined.body.payment.status).toBe('failed');
    expect((await ctx.http().get(`/api/v1/orders/${order.id}`).set(user.auth)).body.status).toBe(
      'pending_payment',
    );

    provider.next = async (r) => ({ status: 'succeeded', providerRef: `ok_${r.reference}` });
    const retry = await pay(user, order.id);
    expect(retry.status).toBe(201);
    const list = await ctx.http().get(`/api/v1/orders/${order.id}/payments`).set(user.auth);
    expect(list.body.map((p: { status: string }) => p.status)).toEqual(['failed', 'succeeded']);
    const audit = await ctx.pool.query(
      `select action from audit_log where entity_type = 'order' and entity_id = $1 order by id`,
      [order.id],
    );
    expect(audit.rows.map((r) => r.action)).toContain('payment.failed');
  });

  it('answers 502 when the gateway breaks, and holds the order against a second charge', async () => {
    const { user, order } = await placeOrder();
    provider.next = async () => {
      throw new Error('gateway timeout');
    };
    const broken = await pay(user, order.id);
    expect(broken.status).toBe(502);
    expect(broken.body.code).toBe('payment-provider-error');

    // The outcome is unknown, so a second attempt must not charge again while the first is pending.
    provider.next = async (r) => ({ status: 'succeeded', providerRef: `ok_${r.reference}` });
    const second = await pay(user, order.id);
    expect(second.status).toBe(409);
    expect(second.body.code).toBe('payment-in-progress');
  });

  it('lets a retry through once an abandoned pending payment has gone stale', async () => {
    const { user, order } = await placeOrder();
    provider.next = async () => {
      throw new Error('gateway timeout');
    };
    await pay(user, order.id);
    await ctx.pool.query(
      `update payments set created_at = now() - interval '10 minutes' where order_id = $1`,
      [order.id],
    );
    provider.next = async (r) => ({ status: 'succeeded', providerRef: `ok_${r.reference}` });
    const retry = await pay(user, order.id);
    expect(retry.status).toBe(201);
  });

  it('records a charge for an order cancelled mid-payment and queues a refund', async () => {
    const { user, order } = await placeOrder();
    provider.next = async (r) => {
      // The customer cancels in another tab while the gateway is still working.
      await ctx.http().post(`/api/v1/orders/${order.id}/cancel`).set(user.auth);
      return { status: 'succeeded', providerRef: `late_${r.reference}` };
    };
    const res = await pay(user, order.id);
    expect(res.status).toBe(409);
    const outbox = await ctx.pool.query(
      `select payload from outbox_events where topic = 'payment.refund-required' and payload->>'orderId' = $1`,
      [order.id],
    );
    expect(outbox.rows).toHaveLength(1);
    expect(outbox.rows[0].payload.amountMinor).toBe(7_500);
    expect((await ctx.http().get(`/api/v1/orders/${order.id}`).set(user.auth)).body.status).toBe(
      'cancelled',
    );
  });

  it('lets the database refuse a second successful payment for one order', async () => {
    const { user, order } = await placeOrder();
    provider.next = async (r) => ({ status: 'succeeded', providerRef: `ok_${r.reference}` });
    await pay(user, order.id);
    await expect(
      ctx.pool.query(
        `insert into payments (order_id, amount_minor, method, provider, status)
         values ($1, 7500, 'card', 'scripted', 'succeeded')`,
        [order.id],
      ),
    ).rejects.toThrow(/payments_one_success_per_order/);
  });
});
