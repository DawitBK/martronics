'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Notice } from '@/components/ui';
import { addToCart, MAX_PER_LINE } from '@/lib/cart-client';

export function AddToCart({
  productId,
  stock,
  signedIn,
}: {
  productId: string;
  stock: number;
  signedIn: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const max = Math.min(stock, MAX_PER_LINE);

  if (stock <= 0) {
    return (
      <button className="btn w-full sm:w-auto" disabled>
        Sold out
      </button>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium" htmlFor="qty">
          Quantity
        </label>
        <input
          id="qty"
          className="input w-20"
          type="number"
          min={1}
          max={max}
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.min(Math.max(Math.trunc(Number(e.target.value)) || 1, 1), max))
          }
        />
        <button
          className="btn btn-primary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            setAdded(false);
            const r = await addToCart(signedIn, productId, quantity);
            setBusy(false);
            if (r.ok) setAdded(true);
            else setError(r.message ?? 'Could not add this to your cart.');
          }}
        >
          {busy ? 'Adding…' : 'Add to cart'}
        </button>
      </div>
      {added ? (
        <Notice tone="good">
          Added to your cart.{' '}
          <Link className="font-medium underline" href="/cart">
            View cart
          </Link>
        </Notice>
      ) : null}
      {error ? <Notice tone="bad">{error}</Notice> : null}
    </div>
  );
}
