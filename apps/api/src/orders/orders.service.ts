import { Inject, Injectable } from '@nestjs/common';
import { conflict, notFound, ProblemException, toPage, unprocessable } from '@martronics/kit';
import { and, asc, count, desc, eq, inArray, isNull, sql, type SQL } from 'drizzle-orm';
import { recordAudit } from '../common/audit.js';
import type { Principal } from '../common/auth.js';
import { runIdempotent, type Outcome } from '../common/idempotency.js';
import { DB, type Database, type Tx } from '../db/db.module.js';
import {
  cartItems,
  carts,
  CURRENCY,
  orderItems,
  orders,
  outboxEvents,
  payments,
  products,
  type OrderRow,
} from '../db/schema.js';
import type { CreatePayment, ListOrdersQuery, OrderDto, PaymentDto } from './orders.contract.js';
import { PAYMENT_PROVIDER, type PaymentProvider } from './payment-provider.js';

const SORT = {
  createdAt: orders.createdAt,
  totalMinor: orders.totalMinor,
} as const;

/** A pending payment older than this is treated as abandoned (its caller crashed or timed out). */
const STALE_PAYMENT_MINUTES = 5;

type PaymentRow = typeof payments.$inferSelect;
type OrderItemRow = typeof orderItems.$inferSelect;

const toPaymentDto = (row: PaymentRow): PaymentDto => ({
  id: row.id,
  orderId: row.orderId,
  amountMinor: row.amountMinor,
  currency: row.currency,
  method: row.method,
  status: row.status,
  createdAt: row.createdAt.toISOString(),
});

const toOrderDto = (row: OrderRow, items: OrderItemRow[]): OrderDto => ({
  id: row.id,
  number: row.number,
  userId: row.userId,
  status: row.status,
  totalMinor: row.totalMinor,
  currency: row.currency,
  items: items.map((i) => ({
    productId: i.productId,
    productName: i.productName,
    unitPriceMinor: i.unitPriceMinor,
    quantity: i.quantity,
    lineTotalMinor: i.unitPriceMinor * i.quantity,
  })),
  version: row.version,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

type Settlement =
  | { kind: 'paid'; payment: PaymentDto }
  | { kind: 'declined'; payment: PaymentDto }
  | { kind: 'orphaned' };

const isStaff = (p: Principal) => p.role === 'manager' || p.role === 'admin';

async function enqueue(tx: Tx, topic: string, payload: Record<string, unknown>): Promise<void> {
  await tx.insert(outboxEvents).values({ topic, payload });
}

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DB) private readonly db: Database,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  /**
   * Turn the caller's cart into an order. Stock is taken with one conditional UPDATE per product
   * (`stock >= quantity`), so two simultaneous checkouts can never both pass the check, and the
   * price snapshot comes from that same locked row, never from the client.
   */
  async checkout(principal: Principal, key: string | undefined): Promise<Outcome<OrderDto>> {
    return runIdempotent(this.db, principal.userId, key, {}, async (tx) => {
      const lines = await tx
        .select({ productId: cartItems.productId, quantity: cartItems.quantity })
        .from(carts)
        .innerJoin(cartItems, eq(cartItems.cartId, carts.id))
        .where(eq(carts.userId, principal.userId))
        // A fixed lock order keeps concurrent checkouts of overlapping carts from deadlocking.
        .orderBy(asc(cartItems.productId));
      if (lines.length === 0) {
        throw unprocessable('cart-empty', 'Your cart is empty', 'Add products before checking out');
      }

      const snapshots: { productId: string; name: string; priceMinor: number; quantity: number }[] =
        [];
      for (const line of lines) {
        const [taken] = await tx
          .update(products)
          .set({
            stock: sql`${products.stock} - ${line.quantity}`,
            version: sql`${products.version} + 1`,
            updatedAt: sql`now()`,
          })
          .where(
            and(
              eq(products.id, line.productId),
              eq(products.status, 'active'),
              isNull(products.deletedAt),
              sql`${products.stock} >= ${line.quantity}`,
            ),
          )
          .returning({ name: products.name, priceMinor: products.priceMinor });
        if (!taken) {
          const [p] = await tx.select().from(products).where(eq(products.id, line.productId));
          const unavailable = !p || p.status !== 'active' || p.deletedAt !== null;
          throw conflict(
            unavailable ? 'product-unavailable' : 'insufficient-stock',
            unavailable ? 'A product is no longer available' : 'Not enough stock',
            `"${p?.name ?? line.productId}"${unavailable ? '' : ` has ${p!.stock} left, you asked for ${line.quantity}`}`,
          );
        }
        snapshots.push({
          productId: line.productId,
          name: taken.name,
          priceMinor: taken.priceMinor,
          quantity: line.quantity,
        });
      }

      const totalMinor = snapshots.reduce((sum, s) => sum + s.priceMinor * s.quantity, 0);
      const seq = await tx.execute<{ n: string }>(sql`select nextval('order_number_seq') as n`);
      const number = `MT-${seq.rows[0]!.n}`;
      const [order] = await tx
        .insert(orders)
        .values({ number, userId: principal.userId, totalMinor, currency: CURRENCY })
        .returning();
      const itemRows = await tx
        .insert(orderItems)
        .values(
          snapshots.map((s) => ({
            orderId: order!.id,
            productId: s.productId,
            productName: s.name,
            unitPriceMinor: s.priceMinor,
            quantity: s.quantity,
          })),
        )
        .returning();
      await tx
        .delete(cartItems)
        .where(
          sql`${cartItems.cartId} = (select id from carts where user_id = ${principal.userId})`,
        );
      const body = toOrderDto(order!, itemRows);
      await recordAudit(tx, {
        actor: principal.userId,
        action: 'order.placed',
        entityType: 'order',
        entityId: body.id,
        after: body,
      });
      await enqueue(tx, 'order.placed', { orderId: body.id, number, userId: principal.userId });
      return { status: 201, body };
    });
  }

  async get(principal: Principal, id: string): Promise<OrderDto> {
    const [row] = await this.db.select().from(orders).where(eq(orders.id, id));
    // Someone else's order answers exactly like a missing one, so ids cannot be probed.
    if (!row || (row.userId !== principal.userId && !isStaff(principal))) {
      throw notFound(`Order ${id} does not exist`);
    }
    const items = await this.db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return toOrderDto(row, items);
  }

  async list(principal: Principal, query: ListOrdersQuery) {
    const where: SQL[] = [];
    if (isStaff(principal)) {
      if (query.userId) where.push(eq(orders.userId, query.userId));
    } else {
      where.push(eq(orders.userId, principal.userId));
    }
    if (query.status) where.push(eq(orders.status, query.status));
    const order = [
      ...query.sort.map((s) => (s.direction === 'asc' ? asc : desc)(SORT[s.field])),
      asc(orders.id),
    ];
    const [rows, totals] = await Promise.all([
      this.db
        .select()
        .from(orders)
        .where(and(...where))
        .orderBy(...order)
        .limit(query.limit)
        .offset(query.offset),
      this.db
        .select({ total: count() })
        .from(orders)
        .where(and(...where)),
    ]);
    const items = rows.length
      ? await this.db
          .select()
          .from(orderItems)
          .where(
            inArray(
              orderItems.orderId,
              rows.map((r) => r.id),
            ),
          )
      : [];
    return toPage(
      rows.map((r) =>
        toOrderDto(
          r,
          items.filter((i) => i.orderId === r.id),
        ),
      ),
      totals[0]?.total ?? 0,
      query,
    );
  }

  /** Cancel an unpaid order and put its stock back, in one transaction. */
  async cancel(principal: Principal, id: string): Promise<OrderDto> {
    return this.db.transaction(async (tx) => {
      const order = await this.lockVisible(tx, principal, id);
      if (order.status !== 'pending_payment') {
        throw conflict(
          'order-not-cancellable',
          'Order cannot be cancelled',
          `An order that is ${order.status} cannot be cancelled here`,
        );
      }
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, id));
      for (const item of [...items].sort((a, b) => a.productId.localeCompare(b.productId))) {
        await tx
          .update(products)
          .set({
            stock: sql`${products.stock} + ${item.quantity}`,
            version: sql`${products.version} + 1`,
            updatedAt: sql`now()`,
          })
          .where(eq(products.id, item.productId));
      }
      const [row] = await tx
        .update(orders)
        .set({ status: 'cancelled', version: sql`${orders.version} + 1`, updatedAt: sql`now()` })
        .where(eq(orders.id, id))
        .returning();
      const after = toOrderDto(row!, items);
      await recordAudit(tx, {
        actor: principal.userId,
        action: 'order.cancelled',
        entityType: 'order',
        entityId: id,
        before: toOrderDto(order, items),
        after,
      });
      await enqueue(tx, 'order.cancelled', { orderId: id, number: order.number });
      return after;
    });
  }

  /** Staff mark a paid order as fulfilled. */
  async fulfill(principal: Principal, id: string): Promise<OrderDto> {
    return this.db.transaction(async (tx) => {
      const order = await this.lockVisible(tx, principal, id);
      if (order.status !== 'paid') {
        throw conflict(
          'order-not-fulfillable',
          'Order cannot be fulfilled',
          `Only a paid order can be fulfilled; this one is ${order.status}`,
        );
      }
      const [row] = await tx
        .update(orders)
        .set({ status: 'fulfilled', version: sql`${orders.version} + 1`, updatedAt: sql`now()` })
        .where(eq(orders.id, id))
        .returning();
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, id));
      const after = toOrderDto(row!, items);
      await recordAudit(tx, {
        actor: principal.userId,
        action: 'order.fulfilled',
        entityType: 'order',
        entityId: id,
        before: toOrderDto(order, items),
        after,
      });
      await enqueue(tx, 'order.fulfilled', { orderId: id, number: order.number });
      return after;
    });
  }

  /**
   * Pay for an order. The amount is always the order total held here. The gateway is called
   * between two short transactions (never inside one), and a charge that succeeds for an order
   * that was cancelled meanwhile is recorded and queued for refund rather than lost.
   */
  async pay(principal: Principal, orderId: string, input: CreatePayment): Promise<PaymentDto> {
    const attempt = await this.db.transaction(async (tx) => {
      const order = await this.lockVisible(tx, principal, orderId);
      if (order.userId !== principal.userId) throw notFound(`Order ${orderId} does not exist`);
      if (order.status !== 'pending_payment') {
        throw conflict(
          'order-not-payable',
          'Order cannot be paid',
          `An order that is ${order.status} cannot be paid`,
        );
      }
      await tx
        .update(payments)
        .set({ status: 'failed', updatedAt: sql`now()` })
        .where(
          and(
            eq(payments.orderId, orderId),
            eq(payments.status, 'pending'),
            sql`${payments.createdAt} < now() - make_interval(mins => ${STALE_PAYMENT_MINUTES})`,
          ),
        );
      const [inFlight] = await tx
        .select({ id: payments.id })
        .from(payments)
        .where(and(eq(payments.orderId, orderId), eq(payments.status, 'pending')));
      if (inFlight) {
        throw conflict('payment-in-progress', 'A payment for this order is already in progress');
      }
      const [row] = await tx
        .insert(payments)
        .values({
          orderId,
          amountMinor: order.totalMinor,
          currency: order.currency,
          method: input.method,
          provider: this.provider.name,
        })
        .returning();
      return { payment: row!, order };
    });

    let result;
    try {
      result = await this.provider.charge({
        reference: attempt.payment.id,
        amountMinor: attempt.payment.amountMinor,
        currency: attempt.payment.currency,
        method: input.method,
      });
    } catch {
      // The outcome is unknown, so the payment stays pending for reconciliation (it expires after
      // STALE_PAYMENT_MINUTES, after which the customer may try again).
      throw new ProblemException(
        502,
        'payment-provider-error',
        'Payment provider unavailable',
        'The charge outcome is unknown; check your order before trying again',
      );
    }

    // The records of a declined or orphaned charge must commit, so the error for those two cases
    // is raised after the transaction ends.
    const outcome = await this.db.transaction(async (tx): Promise<Settlement> => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for('update');
      const settle = async (status: 'succeeded' | 'failed') => {
        const [row] = await tx
          .update(payments)
          .set({ status, providerRef: result.providerRef, updatedAt: sql`now()` })
          .where(eq(payments.id, attempt.payment.id))
          .returning();
        return row!;
      };
      if (result.status === 'failed') {
        const failed = await settle('failed');
        await recordAudit(tx, {
          actor: principal.userId,
          action: 'payment.failed',
          entityType: 'order',
          entityId: orderId,
          after: toPaymentDto(failed),
        });
        return { kind: 'declined', payment: toPaymentDto(failed) };
      }
      if (!order || order.status !== 'pending_payment') {
        // Charged, but the order was cancelled while the gateway was working: keep the evidence.
        const row = await settle('failed');
        await enqueue(tx, 'payment.refund-required', {
          orderId,
          paymentId: row.id,
          providerRef: result.providerRef,
          amountMinor: row.amountMinor,
        });
        await recordAudit(tx, {
          actor: principal.userId,
          action: 'payment.refund-required',
          entityType: 'order',
          entityId: orderId,
          after: toPaymentDto(row),
        });
        return { kind: 'orphaned' };
      }
      const paid = await settle('succeeded');
      await tx
        .update(orders)
        .set({ status: 'paid', version: sql`${orders.version} + 1`, updatedAt: sql`now()` })
        .where(eq(orders.id, orderId));
      await recordAudit(tx, {
        actor: principal.userId,
        action: 'payment.succeeded',
        entityType: 'order',
        entityId: orderId,
        before: { status: order.status },
        after: { status: 'paid', payment: toPaymentDto(paid) },
      });
      await enqueue(tx, 'order.paid', { orderId, number: order.number, paymentId: paid.id });
      return { kind: 'paid', payment: toPaymentDto(paid) };
    });
    if (outcome.kind === 'declined') this.declined(outcome.payment);
    if (outcome.kind === 'orphaned') {
      throw conflict(
        'order-not-payable',
        'Order was cancelled during payment',
        'The charge will be refunded',
      );
    }
    return outcome.payment;
  }

  async listPayments(principal: Principal, orderId: string): Promise<PaymentDto[]> {
    await this.get(principal, orderId);
    const rows = await this.db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .orderBy(asc(payments.createdAt), asc(payments.id));
    return rows.map(toPaymentDto);
  }

  private declined(payment: PaymentDto): never {
    throw new ProblemException(
      402,
      'payment-declined',
      'Payment declined',
      'The provider declined the charge; try another method',
      { payment },
    );
  }

  /** Lock an order the caller may see; anyone else gets the same 404 as a missing order. */
  private async lockVisible(tx: Tx, principal: Principal, id: string): Promise<OrderRow> {
    const [row] = await tx.select().from(orders).where(eq(orders.id, id)).for('update');
    if (!row || (row.userId !== principal.userId && !isStaff(principal))) {
      throw notFound(`Order ${id} does not exist`);
    }
    return row;
  }
}
