import Link from 'next/link';
import { formatMoney } from '@/lib/format';
import type { Product } from '@/lib/types';

export function ProductImage({
  product,
  className = '',
}: {
  product: Product;
  className?: string;
}) {
  const first = [...product.images].sort((a, b) => a.position - b.position)[0];
  if (!first) {
    return (
      <div
        className={`flex items-center justify-center bg-surface text-3xl font-semibold text-muted ${className}`}
        aria-hidden="true"
      >
        {product.name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={first.url}
      alt={product.name}
      loading="lazy"
      className={`object-cover ${className}`}
    />
  );
}

export function ProductCard({ product }: { product: Product }) {
  const out = product.stock <= 0;
  return (
    <li>
      <Link
        href={`/products/${product.id}`}
        className="card block h-full overflow-hidden hover:border-brand"
      >
        <ProductImage product={product} className="aspect-square w-full" />
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-semibold tabular-nums">
              {formatMoney(product.priceMinor, product.currency)}
            </span>
            <span
              className={`text-xs ${out ? 'text-bad' : product.stock <= 5 ? 'text-warn' : 'text-muted'}`}
            >
              {out ? 'Sold out' : product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
