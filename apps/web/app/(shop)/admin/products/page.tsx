import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Empty, PageHeader, Pager, Table, num, statusTone } from '@/components/ui';
import { formatMoney, label } from '@/lib/format';
import { api, qs } from '@/lib/server-api';
import type { Category, Page, Product, SubCategory } from '@/lib/types';
import { NewProduct } from './product-form';

export const metadata: Metadata = { title: 'Products (admin)', robots: { index: false } };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; categoryId?: string; offset?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status === 'archived' ? 'archived' : 'active';
  const [data, categories, subs] = await Promise.all([
    api<Page<Product>>(
      `/products${qs({ q: sp.q, status, categoryId: sp.categoryId, offset: num(sp.offset), limit: 25, sort: 'name' })}`,
    ),
    api<Page<Category>>('/categories?limit=100'),
    api<Page<SubCategory>>('/sub-categories?limit=100'),
  ]);
  const catName = (id: string) => categories.items.find((c) => c.id === id)?.name ?? '–';

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${data.page.total} ${status} products`}
        actions={<NewProduct categories={categories.items} subCategories={subs.items} />}
      />
      <form className="no-print mb-4 flex flex-wrap items-end gap-2" method="get">
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Search</span>
          <input className="input" name="q" defaultValue={sp.q} placeholder="Name or description" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Category</span>
          <select className="input" name="categoryId" defaultValue={sp.categoryId ?? ''}>
            <option value="">All</option>
            {categories.items.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Show</span>
          <select className="input" name="status" defaultValue={status}>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <button className="btn btn-primary">Filter</button>
      </form>
      {data.items.length === 0 ? (
        <Empty>No products.</Empty>
      ) : (
        <Table head={['Product', 'Category', '>Price', '>Stock', 'Status']}>
          {data.items.map((p) => (
            <tr key={p.id} className="hover:bg-surface">
              <td className="td font-medium">
                <Link className="hover:underline" href={`/admin/products/${p.id}`}>
                  {p.name}
                </Link>
              </td>
              <td className="td text-muted">{catName(p.categoryId)}</td>
              <td className="td text-right tabular-nums">
                {formatMoney(p.priceMinor, p.currency)}
              </td>
              <td className={`td text-right tabular-nums ${p.stock === 0 ? 'text-bad' : ''}`}>
                {p.stock}
              </td>
              <td className="td">
                <Badge tone={statusTone(p.status)}>{label(p.status)}</Badge>
              </td>
            </tr>
          ))}
        </Table>
      )}
      <Pager
        page={data.page}
        path="/admin/products"
        params={{ q: sp.q, status: sp.status, categoryId: sp.categoryId }}
      />
    </>
  );
}
