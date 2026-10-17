import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductImage } from '@/components/product-card';
import { formatMoney } from '@/lib/format';
import { currentUser, publicApiOrNull } from '@/lib/server-api';
import type { Category, Product, SubCategory } from '@/lib/types';
import { AddToCart } from './add-to-cart';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function load(id: string) {
  if (!UUID.test(id)) return null;
  return publicApiOrNull<Product>(`/products/${id}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const product = await load((await params).id);
  if (!product) return { title: 'Product not found', robots: { index: false } };
  const description = product.description.slice(0, 160);
  const image = product.images[0]?.url;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    robots: product.status === 'archived' ? { index: false } : undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await load(id);
  if (!product) notFound();
  const [category, sub, user] = await Promise.all([
    publicApiOrNull<Category>(`/categories/${product.categoryId}`, 300),
    publicApiOrNull<SubCategory>(`/sub-categories/${product.subCategoryId}`, 300),
    currentUser(),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    sku: product.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: product.currency,
      price: (product.priceMinor / 100).toFixed(2),
      availability:
        product.stock > 0 && product.status === 'active'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };
  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Shop', item: '/products' },
      ...(category
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: category.name,
              item: `/products?categoryId=${category.id}`,
            },
          ]
        : []),
      { '@type': 'ListItem', position: category ? 3 : 2, name: product.name },
    ],
  };
  const images = [...product.images].sort((a, b) => a.position - b.position);
  const available = product.status === 'active' ? product.stock : 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs).replace(/</g, '\\u003c') }}
      />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <Link className="hover:underline" href="/products">
          Shop
        </Link>
        {category ? (
          <>
            {' / '}
            <Link className="hover:underline" href={`/products?categoryId=${category.id}`}>
              {category.name}
            </Link>
          </>
        ) : null}
        {sub ? <> / {sub.name}</> : null}
      </nav>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <ProductImage
            product={product}
            className="aspect-square w-full rounded-lg border border-line"
          />
          {images.length > 1 ? (
            <ul className="mt-3 grid grid-cols-4 gap-2">
              {images.slice(1, 5).map((img) => (
                <li key={img.id}>
                  <img
                    src={img.url}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full rounded-md border border-line object-cover"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {formatMoney(product.priceMinor, product.currency)}
          </p>
          <p
            className={`mt-1 text-sm ${available === 0 ? 'text-bad' : available <= 5 ? 'text-warn' : 'text-good'}`}
          >
            {available === 0 ? 'Sold out' : available <= 5 ? `Only ${available} left` : 'In stock'}
          </p>
          <div className="mt-5">
            <AddToCart productId={product.id} stock={available} signedIn={Boolean(user)} />
          </div>
          <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted">
            {product.description}
          </div>
        </div>
      </div>
    </>
  );
}
