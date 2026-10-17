import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge, PageHeader, Stat, statusTone } from '@/components/ui';
import { formatMoney, label } from '@/lib/format';
import { api, apiOrNull } from '@/lib/server-api';
import type { Category, Page, Product, SubCategory } from '@/lib/types';
import { EditProduct } from '../product-form';
import { Images } from './images';

export const metadata: Metadata = { title: 'Product (admin)', robots: { index: false } };

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await apiOrNull<Product>(`/products/${id}`);
  if (!product) notFound();
  const [categories, subs] = await Promise.all([
    api<Page<Category>>('/categories?limit=100'),
    api<Page<SubCategory>>('/sub-categories?limit=100'),
  ]);

  return (
    <>
      <PageHeader
        title={product.name}
        subtitle={`${categories.items.find((c) => c.id === product.categoryId)?.name ?? ''} / ${subs.items.find((s) => s.id === product.subCategoryId)?.name ?? ''}`}
        actions={
          <>
            <Badge tone={statusTone(product.status)}>{label(product.status)}</Badge>
            <EditProduct
              product={product}
              categories={categories.items}
              subCategories={subs.items}
            />
          </>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Price" value={formatMoney(product.priceMinor, product.currency)} />
        <Stat
          label="In stock"
          value={product.stock}
          tone={product.stock === 0 ? 'bad' : undefined}
        />
        <Stat label="Images" value={product.images.length} />
      </div>
      <Images productId={product.id} images={product.images} />
    </>
  );
}
