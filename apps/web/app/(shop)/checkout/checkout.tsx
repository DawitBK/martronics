'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Notice } from '@/components/ui';
import { CART_CHANGED } from '@/lib/cart-client';
import { call, newIdempotencyKey } from '@/lib/client-api';
import type { Order, Payment } from '@/lib/types';

const METHODS = [
  ['card', 'Card'],
  ['mobile_money', 'Mobile money'],
  ['bank_transfer', 'Bank transfer'],
] as const;

export function Checkout({ totalLabel, blocked }: { totalLabel: string; blocked: boolean }) {
  const router = useRouter();
  const [method, setMethod] = useState<(typeof METHODS)[number][0]>('card');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // One key per checkout attempt: a double click or a retry after a dropped connection places one order.
  const key = useRef(newIdempotencyKey());

  async function pay() {
    setBusy(true);
    setError(null);
    const order = await call<Order>('POST', '/orders', {}, { 'idempotency-key': key.current });
    if (!order.ok || !order.data) {
      setBusy(false);
      return setError(order.message ?? 'The order could not be placed.');
    }
    window.dispatchEvent(new Event(CART_CHANGED));
    const payment = await call<Payment>('POST', `/orders/${order.data.id}/payments`, { method });
    // Whatever happened to the payment, the order page is the truth: it shows paid or "try again".
    router.push(
      `/orders/${order.data.id}${payment.ok && payment.data?.status === 'succeeded' ? '?paid=1' : '?pay=failed'}`,
    );
  }

  return (
    <section aria-label="Payment" className="card h-fit space-y-4 p-4">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Pay with</legend>
        <div className="space-y-2">
          {METHODS.map(([value, text]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-2 text-sm hover:bg-surface"
            >
              <input
                type="radio"
                name="method"
                value={value}
                checked={method === value}
                onChange={() => setMethod(value)}
              />
              {text}
            </label>
          ))}
        </div>
      </fieldset>
      {blocked ? (
        <Notice tone="bad">
          Some items are no longer available in these quantities. Update your cart first.
        </Notice>
      ) : null}
      {error ? <Notice tone="bad">{error}</Notice> : null}
      <button
        className="btn btn-primary h-11 w-full text-base"
        disabled={busy || blocked}
        onClick={pay}
      >
        {busy ? 'Placing your order…' : `Pay ${totalLabel}`}
      </button>
      <p className="text-xs text-muted">The total is fixed by the shop at the moment you pay.</p>
    </section>
  );
}
