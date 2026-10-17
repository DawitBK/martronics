import type { MetadataRoute } from 'next';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3011';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/cart',
          '/checkout',
          '/orders',
          '/account',
          '/login',
          '/register',
          '/bff',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
