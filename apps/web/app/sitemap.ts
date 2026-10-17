import type { MetadataRoute } from 'next';
import { publicApi } from '@/lib/server-api';
import type { Category, Page, Product } from '@/lib/types';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3011';
const PAGE = 100;
const MAX_PRODUCTS = 5000;

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
  ];
  try {
    const categories = await publicApi<Page<Category>>('/categories?limit=100', 300);
    for (const c of categories.items) {
      entries.push({
        url: `${SITE_URL}/products?categoryId=${c.id}`,
        changeFrequency: 'daily',
        priority: 0.7,
      });
    }
    for (let offset = 0; offset < MAX_PRODUCTS; offset += PAGE) {
      const page = await publicApi<Page<Product>>(
        `/products?limit=${PAGE}&offset=${offset}&sort=-createdAt`,
        300,
      );
      for (const p of page.items) {
        entries.push({
          url: `${SITE_URL}/products/${p.id}`,
          lastModified: p.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
      if (offset + PAGE >= page.page.total) break;
    }
  } catch {
    // The API being down must not turn the sitemap into an error page for crawlers; serve what is known.
  }
  return entries;
}
