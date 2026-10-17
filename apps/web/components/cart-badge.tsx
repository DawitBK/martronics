'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { call } from '@/lib/client-api';
import { CART_CHANGED, guestCart, mergeGuestCart } from '@/lib/cart-client';
import type { Cart } from '@/lib/types';

/** The cart link with a live count; for a signed-in person it also merges a guest cart once. */
export function CartBadge({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    async function refresh() {
      if (!signedIn) {
        if (alive) setCount(guestCart.count());
        return;
      }
      const r = await call<Cart>('GET', '/cart');
      if (alive && r.ok) setCount((r.data?.items ?? []).reduce((n, i) => n + i.quantity, 0));
    }
    async function start() {
      if (signedIn && guestCart.count() > 0) {
        const merged = await mergeGuestCart();
        if (merged > 0) router.refresh();
      }
      await refresh();
    }
    void start();
    window.addEventListener(CART_CHANGED, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      alive = false;
      window.removeEventListener(CART_CHANGED, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [signedIn, router]);

  return (
    <Link
      href="/cart"
      className="btn relative"
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
    >
      Cart
      {count > 0 ? <span className="badge bg-brand text-brand-ink">{count}</span> : null}
    </Link>
  );
}
