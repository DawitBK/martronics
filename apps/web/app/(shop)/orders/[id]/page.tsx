import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Badge, Notice, PageHeader, Table, statusTone } from '@/components/ui';
import { formatDateTime, formatMoney, label } from '@/lib/format';
import { apiOrNull } from '@/lib/server-api';
import type { Order, Payment } from '@/lib/types';
import { OrderActions } from './order-actions';

export const metadata: Metadata = { title: 'Order', robots: { index: false } };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; pay?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const order = await apiOrNull<Order>(`/orders/${id}`);
  if (!order) notFound();
  const payments = (await apiOrNull<Payment[]>(`/orders/${id}/payments`)) ?? [];

  return (
    <>
      <PageHeader
        title={`Order ${order.number}`}
        subtitle={`Placed ${formatDateTime(order.createdAt)}`}
        actions={<Badge tone={statusTone(order.status)}>{label(order.status)}</Badge>}
      />
      <div className="mb-4 space-y-2">
        {sp.paid === '1' || order.status === 'paid' ? (
          <Notice tone="good">Payment received. Thank you!</Notice>
        ) : null}
        {order.status === 'pending_payment' && sp.pay === 'failed' ? (
          <Notice tone="bad">
            The payment did not go through. Your order is saved; you can try again below.
          </Notice>
        ) : null}
        {order.status === 'fulfilled' ? (
          <Notice tone="good">This order has been fulfilled.</Notice>
        ) : null}
      </div>
      <Table head={['Product', '>Qty', '>Unit price', '>Line total']}>
        {order.items.map((i) => (
          <tr key={i.productId}>
            <td className="td">{i.productName}</td>
            <td className="td text-right tabular-nums">{i.quantity}</td>
            <td className="td text-right tabular-nums">
              {formatMoney(i.unitPriceMinor, order.currency)}
            </td>
            <td className="td text-right tabular-nums">
              {formatMoney(i.lineTotalMinor, order.currency)}
            </td>
          </tr>
        ))}
        <tr className="font-semibold">
          <td className="td" colSpan={3}>
            Total
          </td>
          <td className="td text-right tabular-nums">
            {formatMoney(order.totalMinor, order.currency)}
          </td>
        </tr>
      </Table>

      {payments.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold">Payments</h2>
          <Table head={['When', 'Method', 'Status', '>Amount']}>
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="td">{formatDateTime(p.createdAt)}</td>
                <td className="td">{label(p.method)}</td>
                <td className="td">
                  <Badge tone={statusTone(p.status)}>{label(p.status)}</Badge>
                </td>
                <td className="td text-right tabular-nums">
                  {formatMoney(p.amountMinor, p.currency)}
                </td>
              </tr>
            ))}
          </Table>
        </section>
      ) : null}
      <OrderActions orderId={order.id} status={order.status} />
    </>
  );
}
