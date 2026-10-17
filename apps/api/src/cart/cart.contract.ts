import { z } from 'zod';

export const productParamsSchema = z.object({ productId: z.uuid() });

export const setCartItemSchema = z.object({ quantity: z.number().int().min(1).max(99) }).strict();
export type SetCartItem = z.output<typeof setCartItemSchema>;

export const cartItemSchema = z.object({
  productId: z.uuid(),
  name: z.string(),
  unitPriceMinor: z.number().int().min(0),
  quantity: z.number().int().min(1),
  lineTotalMinor: z.number().int().min(0),
  available: z.number().int().min(0).describe('Stock on hand right now; checkout re-checks it'),
});
export type CartItemDto = z.output<typeof cartItemSchema>;

export const cartSchema = z.object({
  items: z.array(cartItemSchema),
  totalMinor: z.number().int().min(0),
  currency: z.string(),
});
export type CartDto = z.output<typeof cartSchema>;
