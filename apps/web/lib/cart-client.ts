'use client';

import { call } from './client-api';
import type { Cart } from './types';

/**
 * A guest's cart lives in the browser (just product ids and quantities, never prices); a signed-in
 * person's cart lives on the server. When a guest signs in, the browser cart is poured into the
 * server cart once. Prices always come from the API, so nothing here can set a price.
 */
const KEY = 'martronics.cart.v1';
export const CART_CHANGED = 'cart:changed';

export interface GuestLine {
  productId: string;
  quantity: number;
}

export const MAX_PER_LINE = 99;

function read(): GuestLine[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is GuestLine =>
        typeof l === 'object' &&
        l !== null &&
        typeof (l as GuestLine).productId === 'string' &&
        Number.isInteger((l as GuestLine).quantity) &&
        (l as GuestLine).quantity > 0,
    );
  } catch {
    return [];
  }
}

function write(lines: GuestLine[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* private mode or full storage: the cart just does not persist */
  }
  window.dispatchEvent(new Event(CART_CHANGED));
}

export const guestCart = {
  lines: read,
  count: () => read().reduce((n, l) => n + l.quantity, 0),
  set(productId: string, quantity: number) {
    const lines = read().filter((l) => l.productId !== productId);
    if (quantity > 0) lines.push({ productId, quantity: Math.min(quantity, MAX_PER_LINE) });
    write(lines);
  },
  add(productId: string, quantity: number) {
    const current = read().find((l) => l.productId === productId)?.quantity ?? 0;
    guestCart.set(productId, current + quantity);
  },
  clear: () => write([]),
};

export interface AddResult {
  ok: boolean;
  message?: string;
}

/** Add to whichever cart applies. The server cart sets an absolute quantity, so read, then write. */
export async function addToCart(
  signedIn: boolean,
  productId: string,
  quantity: number,
): Promise<AddResult> {
  if (!signedIn) {
    guestCart.add(productId, quantity);
    return { ok: true };
  }
  const cart = await call<Cart>('GET', '/cart');
  if (!cart.ok) return { ok: false, message: cart.message };
  const have = cart.data?.items.find((i) => i.productId === productId)?.quantity ?? 0;
  const r = await call('PUT', `/cart/items/${productId}`, {
    quantity: Math.min(have + quantity, MAX_PER_LINE),
  });
  window.dispatchEvent(new Event(CART_CHANGED));
  return r.ok ? { ok: true } : { ok: false, message: r.message };
}

/** Pour a guest's cart into the signed-in cart. Lines that no longer exist or are out of stock are skipped. */
export async function mergeGuestCart(): Promise<number> {
  const lines = read();
  if (lines.length === 0) return 0;
  const server = await call<Cart>('GET', '/cart');
  if (!server.ok) return 0;
  let merged = 0;
  for (const l of lines) {
    const have = server.data?.items.find((i) => i.productId === l.productId)?.quantity ?? 0;
    const r = await call('PUT', `/cart/items/${l.productId}`, {
      quantity: Math.min(have + l.quantity, MAX_PER_LINE),
    });
    if (r.ok) merged += 1;
  }
  guestCart.clear();
  return merged;
}
