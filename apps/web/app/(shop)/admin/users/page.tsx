import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Badge, Empty, PageHeader, Pager, Table, num } from '@/components/ui';
import { formatDate, label } from '@/lib/format';
import { api, currentUser, qs } from '@/lib/server-api';
import type { Page, User } from '@/lib/types';
import { RoleSelect } from './role-select';

export const metadata: Metadata = { title: 'Users (admin)', robots: { index: false } };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; offset?: string }>;
}) {
  const sp = await searchParams;
  const me = await currentUser();
  if (me?.role !== 'admin') redirect('/admin/products');
  const data = await api<Page<User>>(
    `/users${qs({ q: sp.q, role: sp.role, offset: num(sp.offset), limit: 25 })}`,
  );
  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Only an administrator changes roles. People register themselves as customers."
      />
      <form className="no-print mb-4 flex flex-wrap items-end gap-2" method="get">
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Search</span>
          <input className="input" name="q" defaultValue={sp.q} placeholder="Name or email" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Role</span>
          <select className="input" name="role" defaultValue={sp.role ?? ''}>
            <option value="">All</option>
            {['customer', 'manager', 'admin'].map((r) => (
              <option key={r} value={r}>
                {label(r)}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary">Filter</button>
      </form>
      {data.items.length === 0 ? (
        <Empty>No users match.</Empty>
      ) : (
        <Table head={['Name', 'Email', 'Role', 'Joined']}>
          {data.items.map((u) => (
            <tr key={u.id}>
              <td className="td font-medium">
                {u.firstName} {u.lastName}
                {u.id === me.id ? <Badge tone="info">you</Badge> : null}
              </td>
              <td className="td text-muted">{u.email}</td>
              <td className="td">
                <RoleSelect userId={u.id} role={u.role} disabled={u.id === me.id} />
              </td>
              <td className="td">{formatDate(u.createdAt)}</td>
            </tr>
          ))}
        </Table>
      )}
      <Pager page={data.page} path="/admin/users" params={{ q: sp.q, role: sp.role }} />
    </>
  );
}
