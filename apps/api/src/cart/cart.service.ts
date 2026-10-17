import { Inject, Injectable } from '@nestjs/common';
import { notFound, unprocessable } from '@martronics/kit';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import type { Principal } from '../common/auth.js';
import { DB, type Database, type Tx } from '../db/db.module.js';
import { cartItems, carts, CURRENCY, products } from '../db/schema.js';
import type { CartDto, SetCartItem } from './cart.contract.js';

@Injectable()
export class CartService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async get(principal: Principal): Promise<CartDto> {
    return this.read(this.db, principal.userId);
  }

  async setItem(principal: Principal, productId: string, input: SetCartItem): Promise<CartDto> {
    return this.db.transaction(async (tx) => {
      const [product] = await tx
        .select()
        .from(products)
        .where(and(eq(products.id, productId), isNull(products.deletedAt)));
      if (!product || product.status !== 'active') {
        throw notFound(`Product ${productId} does not exist`);
      }
      if (input.quantity > product.stock) {
        throw unprocessable(
          'insufficient-stock',
          'Not enough stock',
          `Only ${product.stock} of "${product.name}" available`,
        );
      }
      const cartId = await this.ensureCart(tx, principal.userId);
      await tx
        .insert(cartItems)
        .values({ cartId, productId, quantity: input.quantity })
        .onConflictDoUpdate({
          target: [cartItems.cartId, cartItems.productId],
          set: { quantity: input.quantity, updatedAt: sql`now()` },
        });
      return this.read(tx, principal.userId);
    });
  }

  async removeItem(principal: Principal, productId: string): Promise<CartDto> {
    return this.db.transaction(async (tx) => {
      const cartId = await this.ensureCart(tx, principal.userId);
      await tx
        .delete(cartItems)
        .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));
      return this.read(tx, principal.userId);
    });
  }

  async clear(principal: Principal): Promise<void> {
    await this.db.transaction(async (tx) => {
      const cartId = await this.ensureCart(tx, principal.userId);
      await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
    });
  }

  private async ensureCart(tx: Tx, userId: string): Promise<string> {
    // The unique index on user_id makes concurrent first calls converge on one cart.
    await tx.insert(carts).values({ userId }).onConflictDoNothing();
    const [cart] = await tx.select().from(carts).where(eq(carts.userId, userId));
    return cart!.id;
  }

  private async read(executor: Pick<Database, 'select'>, userId: string): Promise<CartDto> {
    const rows = await executor
      .select({
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        name: products.name,
        unitPriceMinor: products.priceMinor,
        available: products.stock,
      })
      .from(carts)
      .innerJoin(cartItems, eq(cartItems.cartId, carts.id))
      .innerJoin(products, eq(products.id, cartItems.productId))
      .where(and(eq(carts.userId, userId), isNull(products.deletedAt)))
      .orderBy(asc(cartItems.createdAt), asc(cartItems.productId));
    const items = rows.map((r) => ({ ...r, lineTotalMinor: r.unitPriceMinor * r.quantity }));
    return {
      items,
      totalMinor: items.reduce((sum, i) => sum + i.lineTotalMinor, 0),
      currency: CURRENCY,
    };
  }
}
