import { pageSchema, paginationQuerySchema, sortQuerySchema } from '@martronics/kit';
import { z } from 'zod';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../db/schema.js';

export const idParamsSchema = z.object({ id: z.uuid() });

export const idempotencyHeaderSchema = z.object({
  'idempotency-key': z
    .string()
    .min(1)
    .max(128)
    .optional()
    .describe('Replays the stored response when the same key is sent again'),
});

export const PAYMENT_METHODS = ['card', 'mobile_money', 'bank_transfer'] as const;

export const orderItemSchema = z.object({
  productId: z.uuid(),
  productName: z.string(),
  unitPriceMinor: z.number().int().min(0),
  quantity: z.number().int().min(1),
  lineTotalMinor: z.number().int().min(0),
});

export const orderSchema = z.object({
  id: z.uuid(),
  number: z.string(),
  userId: z.uuid(),
  status: z.enum(ORDER_STATUSES),
  totalMinor: z.number().int().min(0),
  currency: z.string(),
  items: z.array(orderItemSchema),
  version: z.number().int().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type OrderDto = z.output<typeof orderSchema>;

/** Checkout takes no body: the order is built from the signed-in user's cart, never from client prices. */
export const checkoutSchema = z.object({}).strict();

export const ORDER_SORT_FIELDS = ['createdAt', 'totalMinor'] as const;
export const listOrdersQuerySchema = paginationQuerySchema.extend({
  status: z.enum(ORDER_STATUSES).optional(),
  userId: z.uuid().optional().describe('Staff only; customers always see just their own orders'),
  sort: sortQuerySchema(ORDER_SORT_FIELDS, [{ field: 'createdAt', direction: 'desc' }]),
});
export type ListOrdersQuery = z.output<typeof listOrdersQuerySchema>;
export const orderPageSchema = pageSchema(orderSchema);

/** The amount is not accepted: it is always the order total held by the server. */
export const createPaymentSchema = z.object({ method: z.enum(PAYMENT_METHODS) }).strict();
export type CreatePayment = z.output<typeof createPaymentSchema>;

export const paymentSchema = z.object({
  id: z.uuid(),
  orderId: z.uuid(),
  amountMinor: z.number().int().min(0),
  currency: z.string(),
  method: z.string(),
  status: z.enum(PAYMENT_STATUSES),
  createdAt: z.iso.datetime(),
});
export type PaymentDto = z.output<typeof paymentSchema>;
