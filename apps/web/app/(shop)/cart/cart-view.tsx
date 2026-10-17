'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Empty, Notice } from '@/components/ui';
import { CART_CHANGED, MAX_PER_LINE, guestCart } from '@/lib/cart-client';
import { call } from '@/lib/client-api';
import { formatMoney } from '@/lib/format';
import type { Cart, CartItem, Product } from '@/lib/types';

/** One shape for both carts, so the table below does not care who is looking at it. */
interface Line extends CartItem {
  currency: string;
}

export function CartView({ signedIn }: { signedIn: boolean }) {
  const [lines, setLines] = useState<Line[] | null>(null);
  const [currency, setCurrency] = useState('ETB');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (signedIn) {
      const r = await call<Cart>('GET', '/cart');
      if (!r.ok || !r.data) return setError(r.message ?? 'Your cart could not be loaded.');
      setCurrency(r.data.currency);
      setLines(r.data.items.map((i) => ({ ...i, currency: r.data!.currency })));
      return;
    }
    const wanted = guestCart.lines();
    const found = await Promise.all(
      wanted.map(async (l) => {
        const r = await call<Product>('GET', `/products/${l.productId}`);
        if (!r.ok || !r.data || r.data.status !== 'active') {
          guestCart.set(l.productId, 0); // the product is gone: drop the line
          return null;
        }
        const p = r.data;
        const quantity = Math.min(l.quantity, Math.max(p.stock, 1));
        return {
          productId: p.id,
          name: p.name,
          unitPriceMinor: p.priceMinor,
          quantity,
          lineTotalMinor: p.priceMinor * quantity,
          available: p.stock,
          currency: p.currency,
        } satisfies Line;
      }),
    );
    const ok = found.filter((l): l is Line => l !== null);
    setCurrency(ok[0]?.currency ?? 'ETB');
    setLines(ok);
  }, [signedIn]);

  useEffect(() => {
    void load();
    window.addEventListener(CART_CHANGED, load);
    return () => window.removeEventListener(CART_CHANGED, load);
  }, [load]);

  async function setQuantity(productId: string, quantity: number) {
    setError(null);
    if (!signedIn) {
      guestCart.set(productId, quantity);
      return;
    }
    const r =
      quantity <= 0
        ? await call('DELETE', `/cart/items/${productId}`)
        : await call('PUT', `/cart/items/${productId}`, { quantity });
    if (!r.ok) setError(r.message ?? 'The cart could not be updated.');
    window.dispatchEvent(new Event(CART_CHANGED));
  }

  if (lines === null)
    return (
      <p className="text-sm text-muted" aria-busy="true">
        Loading your cart…
      </p>
    );
  if (lines.length === 0) {
    return (
      <Empty>
        Your cart is empty.{' '}
        <Link className="text-brand hover:underline" href="/products">
          Find something to buy
        </Link>
      </Empty>
    );
  }
  const total = lines.reduce((n, l) => n + l.lineTotalMinor, 0);
  const problem = lines.find((l) => l.quantity > l.available);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <ul className="card divide-y divide-line">
        {lines.map((l) => (
          <li key={l.productId} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <Link className="font-medium hover:underline" href={`/products/${l.productId}`}>
                {l.name}
              </Link>
              <div className="text-sm text-muted">
                {formatMoney(l.unitPriceMinor, l.currency)} each
              </div>
              {l.quantity > l.available ? (
                <div className="text-xs text-bad">
                  {l.available === 0 ? 'Sold out' : `Only ${l.available} left`}; lower the quantity
                  to continue.
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <input
                className="input w-20"
                type="number"
                min={1}
                max={Math.min(Math.max(l.available, 1), MAX_PER_LINE)}
                aria-label={`Quantity of ${l.name}`}
                value={l.quantity}
                onChange={(e) => {
                  const n = Math.trunc(Number(e.target.value));
                  if (Number.isFinite(n) && n >= 1)
                    void setQuantity(l.productId, Math.min(n, MAX_PER_LINE));
                }}
              />
              <span className="w-28 text-right font-semibold tabular-nums">
                {formatMoney(l.lineTotalMinor, l.currency)}
              </span>
              <button
                className="btn"
                onClick={() => setQuantity(l.productId, 0)}
                aria-label={`Remove ${l.name}`}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <aside className="card h-fit space-y-3 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted">Total</span>
          <span className="text-2xl font-semibold tabular-nums">
            {formatMoney(total, currency)}
          </span>
        </div>
        {error ? <Notice tone="bad">{error}</Notice> : null}
        {problem ? (
          <Notice tone="bad">Some items are not available in these quantities.</Notice>
        ) : null}
        {problem ? (
          <button className="btn w-full" disabled>
            Checkout
          </button>
        ) : (
          <Link
            className="btn btn-primary w-full"
            href={signedIn ? '/checkout' : '/login?next=%2Fcheckout'}
          >
            {signedIn ? 'Checkout' : 'Sign in to check out'}
          </Link>
        )}
      </aside>
    </div>
  );
}
