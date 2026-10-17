import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Empty, PageHeader, Pager, Table, num, statusTone } from '@/components/ui';
import { formatDateTime, formatMoney, label } from '@/lib/format';
import { api, qs } from '@/lib/server-api';
import type { Order, Page } from '@/lib/types';

export const metadata: Metadata = { title: 'Your orders', robots: { index: false } };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const sp = await searchParams;
  const data = await api<Page<Order>>(`/orders${qs({ offset: num(sp.offset), limit: 20 })}`);
  return (
    <>
      <PageHeader title="Your orders" />
      {data.items.length === 0 ? (
        <Empty>
          You have not ordered anything yet.{' '}
          <Link className="text-brand hover:underline" href="/products">
            Start shopping
          </Link>
        </Empty>
      ) : (
        <Table head={['Order', 'Placed', 'Status', '>Total']}>
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
            </tr>
          ))}
        </Table>
      )}
      <Pager page={data.page} path="/orders" params={{}} />
    </>
  );
}
