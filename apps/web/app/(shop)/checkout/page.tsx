import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui';
import { formatMoney } from '@/lib/format';
import { api } from '@/lib/server-api';
import type { Cart } from '@/lib/types';
import { Checkout } from './checkout';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

export default async function CheckoutPage() {
  const cart = await api<Cart>('/cart');
  if (cart.items.length === 0) redirect('/cart');
  const blocked = cart.items.some((i) => i.quantity > i.available);
  return (
    <>
      <PageHeader title="Checkout" subtitle="Review your order and choose how to pay." />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section aria-label="Order summary" className="card divide-y divide-line">
          {cart.items.map((i) => (
            <div key={i.productId} className="flex items-center justify-between gap-3 p-4 text-sm">
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="text-muted">
                  {i.quantity} × {formatMoney(i.unitPriceMinor, cart.currency)}
                </div>
              </div>
              <div className="font-semibold tabular-nums">
                {formatMoney(i.lineTotalMinor, cart.currency)}
              </div>
            </div>
          ))}
          <div className="flex items-baseline justify-between p-4">
            <span className="text-sm text-muted">Total</span>
            <span className="text-xl font-semibold tabular-nums">
              {formatMoney(cart.totalMinor, cart.currency)}
            </span>
          </div>
        </section>
        <Checkout totalLabel={formatMoney(cart.totalMinor, cart.currency)} blocked={blocked} />
      </div>
    </>
  );
}
