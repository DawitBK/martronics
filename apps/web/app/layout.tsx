import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3011';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Martronics: electronics and accessories', template: '%s · Martronics' },
  description:
    'Shop phones, computers and accessories at Martronics. Clear prices, live stock and secure checkout.',
  openGraph: { type: 'website', siteName: 'Martronics' },
};

export const viewport: Viewport = { themeColor: '#2f56c9' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
