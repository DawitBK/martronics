import Link from 'next/link';
import type { ReactNode } from 'react';
import { logout } from '@/app/login/actions';
import { CartBadge } from '@/components/cart-badge';
import { currentUser } from '@/lib/server-api';

export default async function ShopLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  const staff = user?.role === 'manager' || user?.role === 'admin';
  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/" className="text-lg font-semibold tracking-tight text-brand">
            Martronics
          </Link>
          <form
            action="/products"
            method="get"
            role="search"
            className="order-last w-full sm:order-none sm:ml-4 sm:w-auto sm:flex-1 sm:max-w-md"
          >
            <input
              className="input"
              type="search"
              name="q"
              placeholder="Search products"
              aria-label="Search products"
              maxLength={100}
            />
          </form>
          <nav aria-label="Account" className="ml-auto flex items-center gap-2 text-sm">
            <Link className="btn" href="/products">
              Shop
            </Link>
            {staff ? (
              <Link className="btn" href="/admin/products">
                Admin
              </Link>
            ) : null}
            {user ? (
              <>
                <Link className="btn" href="/orders">
                  Orders
                </Link>
                <Link className="btn" href="/account">
                  {user.firstName}
                </Link>
                <form action={logout}>
                  <button className="btn">Sign out</button>
                </form>
              </>
            ) : (
              <Link className="btn" href="/login">
                Sign in
              </Link>
            )}
            <CartBadge signedIn={Boolean(user)} />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <footer className="no-print border-t border-line bg-white py-6 text-center text-sm text-muted">
        Martronics. Prices include everything shown at checkout.
      </footer>
    </div>
  );
}
