import { sql } from 'drizzle-orm';
import {
  bigint,
  check,
  index,
  integer,
  jsonb,
  pgSequence,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const ROLES = ['customer', 'manager', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const PRODUCT_STATUSES = ['active', 'archived'] as const;
export const ORDER_STATUSES = ['pending_payment', 'paid', 'fulfilled', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export const PAYMENT_STATUSES = ['pending', 'succeeded', 'failed'] as const;

export const CURRENCY = 'ETB';

const id = () =>
  uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`);
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();
const deletedAt = () => timestamp('deleted_at', { withTimezone: true });
/** Optimistic concurrency token: bumped by every update. */
const version = () => integer('version').notNull().default(1);

export const users = pgTable(
  'users',
  {
    id: id(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    role: text('role', { enum: ROLES }).notNull().default('customer'),
    version: version(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    check('users_role_valid', sql`${t.role} in ('customer', 'manager', 'admin')`),
    check('users_email_lowercase', sql`${t.email} = lower(${t.email})`),
    uniqueIndex('users_email_live_uq')
      .on(t.email)
      .where(sql`${t.deletedAt} is null`),
  ],
);

/** One row per issued refresh token; only the SHA-256 of the token is stored. */
export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    /** All tokens descended from one login share a family; reuse of a spent token revokes it. */
    familyId: uuid('family_id').notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('refresh_tokens_hash_uq').on(t.tokenHash),
    index('refresh_tokens_family_idx').on(t.familyId),
  ],
);

export const categories = pgTable(
  'categories',
  {
    id: id(),
    name: text('name').notNull(),
    version: version(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    check('categories_name_not_blank', sql`length(btrim(${t.name})) > 0`),
    uniqueIndex('categories_name_live_uq')
      .on(sql`lower(${t.name})`)
      .where(sql`${t.deletedAt} is null`),
  ],
);

export const subCategories = pgTable(
  'sub_categories',
  {
    id: id(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    name: text('name').notNull(),
    version: version(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    check('sub_categories_name_not_blank', sql`length(btrim(${t.name})) > 0`),
    // The legacy API made sub-category names unique across the whole catalog.
    uniqueIndex('sub_categories_name_live_uq')
      .on(sql`lower(${t.name})`)
      .where(sql`${t.deletedAt} is null`),
    index('sub_categories_category_idx').on(t.categoryId),
  ],
);

export const products = pgTable(
  'products',
  {
    id: id(),
    name: text('name').notNull(),
    description: text('description').notNull(),
    /** Money is stored as integer minor units (santim), never as a float. */
    priceMinor: bigint('price_minor', { mode: 'number' }).notNull(),
    stock: integer('stock').notNull().default(0),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id),
    subCategoryId: uuid('sub_category_id')
      .notNull()
      .references(() => subCategories.id),
    status: text('status', { enum: PRODUCT_STATUSES }).notNull().default('active'),
    createdBy: uuid('created_by').references(() => users.id),
    version: version(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: deletedAt(),
  },
  (t) => [
    check('products_price_non_negative', sql`${t.priceMinor} >= 0`),
    check('products_stock_non_negative', sql`${t.stock} >= 0`),
    check('products_name_not_blank', sql`length(btrim(${t.name})) > 0`),
    check('products_status_valid', sql`${t.status} in ('active', 'archived')`),
    index('products_category_idx').on(t.categoryId, t.createdAt),
    index('products_sub_category_idx').on(t.subCategoryId),
  ],
);

export const productImages = pgTable(
  'product_images',
  {
    id: id(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    url: text('url').notNull(),
    position: integer('position').notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index('product_images_product_idx').on(t.productId, t.position)],
);

export const carts = pgTable(
  'carts',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('carts_user_uq').on(t.userId)],
);

export const cartItems = pgTable(
  'cart_items',
  {
    cartId: uuid('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    quantity: integer('quantity').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    primaryKey({ columns: [t.cartId, t.productId] }),
    check('cart_items_quantity_positive', sql`${t.quantity} > 0`),
  ],
);

export const orderNumbers = pgSequence('order_number_seq', { startWith: 1000 });

export const orders = pgTable(
  'orders',
  {
    id: id(),
    number: text('number').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    status: text('status', { enum: ORDER_STATUSES }).notNull().default('pending_payment'),
    totalMinor: bigint('total_minor', { mode: 'number' }).notNull(),
    currency: text('currency').notNull().default(CURRENCY),
    version: version(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check('orders_total_non_negative', sql`${t.totalMinor} >= 0`),
    check(
      'orders_status_valid',
      sql`${t.status} in ('pending_payment', 'paid', 'fulfilled', 'cancelled')`,
    ),
    uniqueIndex('orders_number_uq').on(t.number),
    index('orders_user_idx').on(t.userId, t.createdAt),
    index('orders_status_idx').on(t.status, t.createdAt),
  ],
);

export const orderItems = pgTable(
  'order_items',
  {
    id: id(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    /** Name and price are snapshots: a later catalog edit never rewrites a past order. */
    productName: text('product_name').notNull(),
    unitPriceMinor: bigint('unit_price_minor', { mode: 'number' }).notNull(),
    quantity: integer('quantity').notNull(),
  },
  (t) => [
    check('order_items_quantity_positive', sql`${t.quantity} > 0`),
    check('order_items_price_non_negative', sql`${t.unitPriceMinor} >= 0`),
    index('order_items_order_idx').on(t.orderId),
  ],
);

export const payments = pgTable(
  'payments',
  {
    id: id(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id),
    /** Always the order total, set by the server; the client never supplies an amount. */
    amountMinor: bigint('amount_minor', { mode: 'number' }).notNull(),
    currency: text('currency').notNull().default(CURRENCY),
    method: text('method').notNull(),
    provider: text('provider').notNull(),
    providerRef: text('provider_ref'),
    status: text('status', { enum: PAYMENT_STATUSES }).notNull().default('pending'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    check('payments_status_valid', sql`${t.status} in ('pending', 'succeeded', 'failed')`),
    // At most one successful payment per order, enforced by the database.
    uniqueIndex('payments_one_success_per_order')
      .on(t.orderId)
      .where(sql`${t.status} = 'succeeded'`),
    index('payments_order_idx').on(t.orderId),
  ],
);

/** Append-only: a trigger (migration 0001) rejects UPDATE and DELETE. */
export const auditLog = pgTable(
  'audit_log',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    actor: text('actor').notNull(),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    before: jsonb('before'),
    after: jsonb('after'),
    requestId: text('request_id'),
    createdAt: createdAt(),
  },
  (t) => [index('audit_log_entity_idx').on(t.entityType, t.entityId)],
);

/** Stored response for a POST that carried an `Idempotency-Key`. */
export const idempotencyKeys = pgTable(
  'idempotency_keys',
  {
    userId: uuid('user_id').notNull(),
    key: text('key').notNull(),
    requestHash: text('request_hash').notNull(),
    responseStatus: integer('response_status'),
    responseBody: jsonb('response_body'),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.key] })],
);

/** Transactional outbox: a row is written in the same transaction as the change it announces. */
export const outboxEvents = pgTable(
  'outbox_events',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    topic: text('topic').notNull(),
    payload: jsonb('payload').notNull(),
    createdAt: createdAt(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
  },
  (t) => [
    index('outbox_unprocessed_idx')
      .on(t.createdAt)
      .where(sql`${t.processedAt} is null`),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type SubCategoryRow = typeof subCategories.$inferSelect;
export type ProductRow = typeof products.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
