import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { currentUser } from '@/lib/server-api';
import { CartView } from './cart-view';

export const metadata: Metadata = { title: 'Your cart', robots: { index: false } };

export default async function CartPage() {
  const user = await currentUser();
  return (
    <>
      <PageHeader title="Your cart" />
      <CartView signedIn={Boolean(user)} />
    </>
  );
}
