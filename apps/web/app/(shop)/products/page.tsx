import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { Empty, PageHeader, Pager, num } from '@/components/ui';
import { parseMoney } from '@/lib/format';
import { publicApi, qs } from '@/lib/server-api';
import type { Category, Page, Product, SubCategory } from '@/lib/types';

type Search = {
  q?: string;
  categoryId?: string;
  subCategoryId?: string;
  min?: string;
  max?: string;
  sort?: string;
  offset?: string;
};

const SORTS = [
  ['-createdAt', 'Newest'],
  ['priceMinor', 'Price: low to high'],
  ['-priceMinor', 'Price: high to low'],
  ['name', 'Name'],
] as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const title = sp.q ? `Search: ${sp.q}` : 'All products';
  // Filtered and paged listings are for people, not for the index.
  const filtered = Boolean(sp.q || sp.subCategoryId || sp.min || sp.max || sp.sort || sp.offset);
  return {
    title,
    alternates: {
      canonical: sp.categoryId && !filtered ? `/products?categoryId=${sp.categoryId}` : '/products',
    },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const min = sp.min ? parseMoney(sp.min) : null;
  const max = sp.max ? parseMoney(sp.max) : null;
  const sort = SORTS.some(([v]) => v === sp.sort) ? sp.sort : '-createdAt';
  const [categories, subs, data] = await Promise.all([
    publicApi<Page<Category>>('/categories?limit=100&sort=name'),
    sp.categoryId
      ? publicApi<Page<SubCategory>>(
          `/sub-categories${qs({ categoryId: sp.categoryId, limit: 100 })}`,
        )
      : Promise.resolve(null),
    publicApi<Page<Product>>(
      `/products${qs({
        q: sp.q,
        categoryId: sp.categoryId,
        subCategoryId: sp.subCategoryId,
        minPriceMinor: min ?? undefined,
        maxPriceMinor: max ?? undefined,
        sort,
        offset: num(sp.offset),
        limit: 12,
      })}`,
    ),
  ]);
  const active = categories.items.find((c) => c.id === sp.categoryId);
  const keep = { q: sp.q, min: sp.min, max: sp.max, sort: sp.sort };
  const link = (extra: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...keep, ...extra })) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/products?${s}` : '/products';
  };

  return (
    <>
      <PageHeader
        title={active ? active.name : sp.q ? `Results for “${sp.q}”` : 'All products'}
        subtitle={`${data.page.total} product${data.page.total === 1 ? '' : 's'}`}
      />
      <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
        <aside aria-label="Filters" className="space-y-5 text-sm">
          <div>
            <h2 className="mb-2 font-semibold">Category</h2>
            <ul className="space-y-1">
              <li>
                <Link
                  className={!sp.categoryId ? 'font-medium text-brand' : 'hover:underline'}
                  href={link({ categoryId: undefined })}
                >
                  All
                </Link>
              </li>
              {categories.items.map((c) => (
                <li key={c.id}>
                  <Link
                    className={
                      sp.categoryId === c.id ? 'font-medium text-brand' : 'hover:underline'
                    }
                    href={link({ categoryId: c.id })}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
            {subs && subs.items.length > 0 ? (
              <ul className="mt-2 space-y-1 border-l border-line pl-3">
                {subs.items.map((s) => (
                  <li key={s.id}>
                    <Link
                      className={
                        sp.subCategoryId === s.id ? 'font-medium text-brand' : 'hover:underline'
                      }
                      href={link({ categoryId: sp.categoryId, subCategoryId: s.id })}
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <form method="get" className="space-y-2">
            {sp.q ? <input type="hidden" name="q" value={sp.q} /> : null}
            {sp.categoryId ? <input type="hidden" name="categoryId" value={sp.categoryId} /> : null}
            {sp.subCategoryId ? (
              <input type="hidden" name="subCategoryId" value={sp.subCategoryId} />
            ) : null}
            <h2 className="font-semibold">Price</h2>
            <div className="flex gap-2">
              <input
                className="input"
                name="min"
                inputMode="decimal"
                placeholder="Min"
                defaultValue={sp.min}
                aria-label="Lowest price"
              />
              <input
                className="input"
                name="max"
                inputMode="decimal"
                placeholder="Max"
                defaultValue={sp.max}
                aria-label="Highest price"
              />
            </div>
            <label className="block">
              <span className="mb-1 block font-semibold">Sort by</span>
              <select className="input" name="sort" defaultValue={sort}>
                {SORTS.map(([v, text]) => (
                  <option key={v} value={v}>
                    {text}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary w-full">Apply</button>
          </form>
        </aside>

        <section aria-label="Products">
          {data.items.length === 0 ? (
            <Empty>No products match. Try fewer filters or a different search.</Empty>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ul>
          )}
          <Pager
            page={data.page}
            path="/products"
            params={{
              q: sp.q,
              categoryId: sp.categoryId,
              subCategoryId: sp.subCategoryId,
              min: sp.min,
              max: sp.max,
              sort: sp.sort,
            }}
          />
        </section>
      </div>
    </>
  );
}
