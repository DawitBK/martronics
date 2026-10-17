import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { Empty } from '@/components/ui';
import { publicApi } from '@/lib/server-api';
import type { Category, Page, Product } from '@/lib/types';

export default async function HomePage() {
  const [categories, newest] = await Promise.all([
    publicApi<Page<Category>>('/categories?limit=100&sort=name'),
    publicApi<Page<Product>>('/products?limit=8&sort=-createdAt'),
  ]);
  return (
    <>
      <section className="rounded-lg bg-brand px-6 py-10 text-brand-ink">
        <h1 className="max-w-xl text-3xl font-semibold tracking-tight">
          Electronics you can count on
        </h1>
        <p className="mt-2 max-w-xl text-sm opacity-90">
          Phones, computers and accessories with live stock and clear prices. What you see at
          checkout is what you pay.
        </p>
        <Link href="/products" className="btn mt-5 border-white bg-white text-brand">
          Shop all products
        </Link>
      </section>

      {categories.items.length > 0 ? (
        <section aria-label="Categories" className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Shop by category</h2>
          <ul className="flex flex-wrap gap-2">
            {categories.items.map((c) => (
              <li key={c.id}>
                <Link className="btn" href={`/products?categoryId=${c.id}`}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-label="New arrivals" className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">New arrivals</h2>
        {newest.items.length === 0 ? (
          <Empty>The shelves are being stocked. Please check back soon.</Empty>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {newest.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
