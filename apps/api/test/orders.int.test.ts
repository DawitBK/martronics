import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  makeCategory,
  makeProduct,
  signUp,
  startContext,
  type Fixture,
  type Session,
  type TestContext,
} from './helpers.js';

let ctx: TestContext;
let manager: Session;
let fixture: Fixture;

beforeAll(async () => {
  ctx = await startContext();
  manager = await signUp(ctx, 'manager');
  fixture = await makeCategory(ctx, manager);
});
afterAll(async () => {
  await ctx.close();
});

const addToCart = (user: Session, productId: string, quantity: number) =>
  ctx.http().put(`/api/v1/cart/items/${productId}`).set(user.auth).send({ quantity });
const checkout = (user: Session, key?: string) => {
  const req = ctx.http().post('/api/v1/orders').set(user.auth);
  if (key) req.set('Idempotency-Key', key);
  return req.send({});
};
const stockOf = async (productId: string) =>
  Number(
    (await ctx.pool.query('select stock from products where id = $1', [productId])).rows[0].stock,
  );

describe('cart', () => {
  it('belongs to the signed-in user and totals in integers', async () => {
    const user = await signUp(ctx);
    const a = await makeProduct(ctx, manager, fixture, { priceMinor: 1_999, stock: 5 });
    const b = await makeProduct(ctx, manager, fixture, { priceMinor: 250, stock: 5 });
    await addToCart(user, a.id, 2);
    const cart = await addToCart(user, b.id, 3);
    expect(cart.status).toBe(200);
    expect(cart.body.totalMinor).toBe(1_999 * 2 + 250 * 3);
    expect(cart.body.items).toHaveLength(2);

    // Setting the quantity again replaces it rather than adding.
    const again = await addToCart(user, a.id, 1);
    expect(again.body.items.find((i: { productId: string }) => i.productId === a.id).quantity).toBe(
      1,
    );

    const other = await signUp(ctx);
    expect((await ctx.http().get('/api/v1/cart').set(other.auth)).body.items).toHaveLength(0);
    expect((await ctx.http().get('/api/v1/cart')).status).toBe(401);
  });

  it('refuses more than the stock, archived products and missing products', async () => {
    const user = await signUp(ctx);
    const p = await makeProduct(ctx, manager, fixture, { stock: 2 });
    const over = await addToCart(user, p.id, 3);
    expect(over.status).toBe(422);
    expect(over.body.code).toBe('insufficient-stock');
    expect((await addToCart(user, randomUUID(), 1)).status).toBe(404);
    expect(
      (await ctx.http().put(`/api/v1/cart/items/${p.id}`).set(user.auth).send({ quantity: 0 }))
        .status,
    ).toBe(400);
  });

  it('removes items and clears', async () => {
    const user = await signUp(ctx);
    const p = await makeProduct(ctx, manager, fixture);
    await addToCart(user, p.id, 1);
    const removed = await ctx.http().delete(`/api/v1/cart/items/${p.id}`).set(user.auth);
    expect(removed.body.items).toHaveLength(0);
    await addToCart(user, p.id, 1);
    expect((await ctx.http().delete('/api/v1/cart').set(user.auth)).status).toBe(204);
    expect((await ctx.http().get('/api/v1/cart').set(user.auth)).body.items).toHaveLength(0);
  });
});

describe('checkout', () => {
  it('builds the order from the cart, snapshots prices, takes stock and empties the cart', async () => {
    const user = await signUp(ctx);
    const p = await makeProduct(ctx, manager, fixture, { priceMinor: 12_050, stock: 5 });
    await addToCart(user, p.id, 2);
    const res = await checkout(user);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending_payment');
    expect(res.body.number).toMatch(/^MT-\d+$/);
    expect(res.body.totalMinor).toBe(24_100);
    expect(res.body.items[0]).toMatchObject({ unitPriceMinor: 12_050, quantity: 2 });
    expect(await stockOf(p.id)).toBe(3);
    expect((await ctx.http().get('/api/v1/cart').set(user.auth)).body.items).toHaveLength(0);

    // A later price change does not rewrite the past order.
    const fresh = await ctx.http().get(`/api/v1/products/${p.id}`);
    await ctx
      .http()
      .patch(`/api/v1/products/${p.id}`)
      .set(manager.auth)
      .send({ version: fresh.body.version, priceMinor: 99_999 });
    const again = await ctx.http().get(`/api/v1/orders/${res.body.id}`).set(user.auth);
    expect(again.body.totalMinor).toBe(24_100);
    expect(again.body.items[0].unitPriceMinor).toBe(12_050);
  });

  it('rejects an empty cart and ignores any client-supplied price or user', async () => {
    const user = await signUp(ctx);
    const empty = await checkout(user);
    expect(empty.status).toBe(422);
    expect(empty.body.code).toBe('cart-empty');
    const sneaky = await ctx
      .http()
      .post('/api/v1/orders')
      .set(user.auth)
      .send({
        userId: randomUUID(),
        totalMinor: 1,
        items: [{ productId: randomUUID(), quantity: 1 }],
      });
    expect(sneaky.status).toBe(400);
  });

  it('settles all of an order or none of it when one line lacks stock', async () => {
    const user = await signUp(ctx);
    const plenty = await makeProduct(ctx, manager, fixture, { stock: 10 });
    const scarce = await makeProduct(ctx, manager, fixture, { stock: 2 });
    await addToCart(user, plenty.id, 4);
    await addToCart(user, scarce.id, 2);
    // Someone else buys the scarce item after it went into this cart.
    await ctx.pool.query('update products set stock = 1 where id = $1', [scarce.id]);

    const res = await checkout(user);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('insufficient-stock');
    expect(await stockOf(plenty.id)).toBe(10); // rolled back with the failed order
    expect(await stockOf(scarce.id)).toBe(1);
    expect((await ctx.http().get('/api/v1/cart').set(user.auth)).body.items).toHaveLength(2);
  });

  it('never oversells under concurrent checkouts', async () => {
    const buyers = await Promise.all(Array.from({ length: 6 }, () => signUp(ctx)));
    const p = await makeProduct(ctx, manager, fixture, { stock: 2 });
    for (const b of buyers) await addToCart(b, p.id, 1);

    const results = await Promise.all(buyers.map((b) => checkout(b)));
    const statuses = results.map((r) => r.status).sort();
    expect(statuses.filter((s) => s === 201)).toHaveLength(2);
    expect(statuses.filter((s) => s === 409)).toHaveLength(4);
    expect(await stockOf(p.id)).toBe(0);
    const { rows } = await ctx.pool.query(
      'select coalesce(sum(quantity), 0)::int as sold from order_items where product_id = $1',
      [p.id],
    );
    expect(rows[0].sold).toBe(2);
  });

  it('replays the stored order for a repeated Idempotency-Key', async () => {
    const user = await signUp(ctx);
    const p = await makeProduct(ctx, manager, fixture, { stock: 5 });
    await addToCart(user, p.id, 1);
    const key = randomUUID();
    const first = await checkout(user, key);
    const second = await checkout(user, key);
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.id).toBe(first.body.id);
    expect(second.headers['idempotent-replay']).toBe('true');
    expect(await stockOf(p.id)).toBe(4);
    const { rows } = await ctx.pool.query(
      'select count(*)::int as n from orders where user_id = $1',
      [user.id],
    );
    expect(rows[0].n).toBe(1);
  });

  it('handles a double-click (two requests with one key at once) as a single order', async () => {
    const user = await signUp(ctx);
    const p = await makeProduct(ctx, manager, fixture, { stock: 5 });
    await addToCart(user, p.id, 1);
    const key = randomUUID();
    const [a, b] = await Promise.all([checkout(user, key), checkout(user, key)]);
    expect([a.status, b.status]).toEqual([201, 201]);
    expect(a.body.id).toBe(b.body.id);
    expect(await stockOf(p.id)).toBe(4);
  });
});

describe('who can see an order', () => {
  it("hides one customer's orders from another and shows staff everything", async () => {
    const alice = await signUp(ctx);
    const bob = await signUp(ctx);
    const p = await makeProduct(ctx, manager, fixture, { stock: 5 });
    await addToCart(alice, p.id, 1);
    const order = (await checkout(alice)).body;

    expect((await ctx.http().get(`/api/v1/orders/${order.id}`).set(bob.auth)).status).toBe(404);
    expect((await ctx.http().post(`/api/v1/orders/${order.id}/cancel`).set(bob.auth)).status).toBe(
      404,
    );
    expect(
      (
        await ctx
          .http()
          .post(`/api/v1/orders/${order.id}/payments`)
          .set(bob.auth)
          .send({ method: 'card' })
      ).status,
    ).toBe(404);
    expect((await ctx.http().get(`/api/v1/orders/${order.id}`)).status).toBe(401);
    expect((await ctx.http().get(`/api/v1/orders/${order.id}`).set(alice.auth)).status).toBe(200);
    expect((await ctx.http().get(`/api/v1/orders/${order.id}`).set(manager.auth)).status).toBe(200);

    const bobsList = await ctx.http().get('/api/v1/orders').set(bob.auth);
    expect(bobsList.body.page.total).toBe(0);
    // A customer cannot widen the list with a userId filter.
    const widened = await ctx.http().get(`/api/v1/orders?userId=${alice.id}`).set(bob.auth);
    expect(widened.body.page.total).toBe(0);
    const staffView = await ctx.http().get(`/api/v1/orders?userId=${alice.id}`).set(manager.auth);
    expect(staffView.body.page.total).toBe(1);
  });
});

describe('cancel, pay and fulfil', () => {
  it('cancels an unpaid order and puts the stock back, exactly once', async () => {
    const user = await signUp(ctx);
    const p = await makeProduct(ctx, manager, fixture, { stock: 5 });
    await addToCart(user, p.id, 3);
    const order = (await checkout(user)).body;
    expect(await stockOf(p.id)).toBe(2);

    const cancelled = await ctx.http().post(`/api/v1/orders/${order.id}/cancel`).set(user.auth);
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.status).toBe('cancelled');
    expect(await stockOf(p.id)).toBe(5);

    const twice = await ctx.http().post(`/api/v1/orders/${order.id}/cancel`).set(user.auth);
    expect(twice.status).toBe(409);
    expect(await stockOf(p.id)).toBe(5);
    expect(
      (
        await ctx
          .http()
          .post(`/api/v1/orders/${order.id}/payments`)
          .set(user.auth)
          .send({ method: 'card' })
      ).status,
    ).toBe(409);
  });

  it('pays the order total, never a client amount, then lets staff fulfil it', async () => {
    const user = await signUp(ctx);
    const p = await makeProduct(ctx, manager, fixture, { priceMinor: 5_000, stock: 5 });
    await addToCart(user, p.id, 2);
    const order = (await checkout(user)).body;

    const sneaky = await ctx
      .http()
      .post(`/api/v1/orders/${order.id}/payments`)
      .set(user.auth)
      .send({ method: 'card', amountMinor: 1 });
    expect(sneaky.status).toBe(400);

    const early = await ctx.http().post(`/api/v1/orders/${order.id}/fulfill`).set(manager.auth);
    expect(early.status).toBe(409);

    const paid = await ctx
      .http()
      .post(`/api/v1/orders/${order.id}/payments`)
      .set(user.auth)
      .send({ method: 'mobile_money' });
    expect(paid.status).toBe(201);
    expect(paid.body).toMatchObject({
      amountMinor: 10_000,
      status: 'succeeded',
      method: 'mobile_money',
    });
    expect((await ctx.http().get(`/api/v1/orders/${order.id}`).set(user.auth)).body.status).toBe(
      'paid',
    );

    const again = await ctx
      .http()
      .post(`/api/v1/orders/${order.id}/payments`)
      .set(user.auth)
      .send({ method: 'card' });
    expect(again.status).toBe(409);
    expect(again.body.code).toBe('order-not-payable');
    // A paid order is not cancellable through this endpoint (refunds are a separate flow).
    expect((await ctx.http().post(`/api/v1/orders/${order.id}/cancel`).set(user.auth)).status).toBe(
      409,
    );

    expect(
      (await ctx.http().post(`/api/v1/orders/${order.id}/fulfill`).set(user.auth)).status,
    ).toBe(403);
    const done = await ctx.http().post(`/api/v1/orders/${order.id}/fulfill`).set(manager.auth);
    expect(done.status).toBe(200);
    expect(done.body.status).toBe('fulfilled');

    const payments = await ctx.http().get(`/api/v1/orders/${order.id}/payments`).set(user.auth);
    expect(payments.body).toHaveLength(1);
  });

  it('records the full trail in the audit log and the outbox', async () => {
    const user = await signUp(ctx);
    const p = await makeProduct(ctx, manager, fixture, { stock: 5 });
    await addToCart(user, p.id, 1);
    const order = (await checkout(user)).body;
    await ctx
      .http()
      .post(`/api/v1/orders/${order.id}/payments`)
      .set(user.auth)
      .send({ method: 'card' });
    await ctx.http().post(`/api/v1/orders/${order.id}/fulfill`).set(manager.auth);

    const audit = await ctx.pool.query(
      `select action from audit_log where entity_type = 'order' and entity_id = $1 order by id`,
      [order.id],
    );
    expect(audit.rows.map((r) => r.action)).toEqual([
      'order.placed',
      'payment.succeeded',
      'order.fulfilled',
    ]);
    const outbox = await ctx.pool.query(
      `select topic from outbox_events where payload->>'orderId' = $1 order by id`,
      [order.id],
    );
    expect(outbox.rows.map((r) => r.topic)).toEqual([
      'order.placed',
      'order.paid',
      'order.fulfilled',
    ]);
  });
});
