import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { currentUser } from '@/lib/server-api';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!user) redirect('/login?next=%2Fadmin%2Fproducts');
  if (user.role !== 'manager' && user.role !== 'admin') redirect('/');
  const links = [
    ['/admin/products', 'Products'],
    ['/admin/categories', 'Categories'],
    ['/admin/orders', 'Orders'],
    ...(user.role === 'admin' ? [['/admin/users', 'Users']] : []),
  ] as const;
  return (
    <div>
      <nav
        aria-label="Admin"
        className="no-print mb-5 flex flex-wrap gap-2 border-b border-line pb-3"
      >
        {links.map(([href, text]) => (
          <Link key={href} className="btn" href={href}>
            {text}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
