import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionButton } from '@/components/form';
import { Badge, Empty, PageHeader, Pager, Table, num, statusTone } from '@/components/ui';
import { formatDateTime, formatMoney, label } from '@/lib/format';
import { api, qs } from '@/lib/server-api';
import type { Order, Page } from '@/lib/types';

export const metadata: Metadata = { title: 'Orders (admin)', robots: { index: false } };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; offset?: string }>;
}) {
  const sp = await searchParams;
  const data = await api<Page<Order>>(
    `/orders${qs({ status: sp.status, offset: num(sp.offset), limit: 25 })}`,
  );
  return (
    <>
      <PageHeader title="Orders" subtitle={`${data.page.total} orders`} />
      <form className="no-print mb-4 flex items-end gap-2" method="get">
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Status</span>
          <select className="input" name="status" defaultValue={sp.status ?? ''}>
            <option value="">All</option>
            <option value="pending_payment">Pending payment</option>
            <option value="paid">Paid, to fulfil</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <button className="btn btn-primary">Filter</button>
      </form>
      {data.items.length === 0 ? (
        <Empty>No orders.</Empty>
      ) : (
        <Table head={['Order', 'Placed', 'Status', '>Total', '']}>
          {data.items.map((o) => (
            <tr key={o.id} className="hover:bg-surface">
              <td className="td font-medium">
                <Link className="hover:underline" href={`/orders/${o.id}`}>
                  {o.number}
                </Link>
              </td>
              <td className="td">{formatDateTime(o.createdAt)}</td>
              <td className="td">
                <Badge tone={statusTone(o.status)}>{label(o.status)}</Badge>
              </td>
              <td className="td text-right tabular-nums">
                {formatMoney(o.totalMinor, o.currency)}
              </td>
              <td className="td text-right">
                {o.status === 'paid' ? (
                  <ActionButton
                    primary
                    label="Mark fulfilled"
                    path={`/orders/${o.id}/fulfill`}
                    confirm={`Mark ${o.number} as fulfilled?`}
                  />
                ) : null}
              </td>
            </tr>
          ))}
        </Table>
      )}
      <Pager page={data.page} path="/admin/orders" params={{ status: sp.status }} />
    </>
  );
}
