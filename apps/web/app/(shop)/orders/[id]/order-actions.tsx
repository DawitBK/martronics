'use client';

import { useState } from 'react';
import { ActionButton, useMutation } from '@/components/form';
import { Notice } from '@/components/ui';
import type { OrderStatus } from '@/lib/types';

const METHODS = [
  ['card', 'Card'],
  ['mobile_money', 'Mobile money'],
  ['bank_transfer', 'Bank transfer'],
] as const;

export function OrderActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [method, setMethod] = useState<(typeof METHODS)[number][0]>('card');
  const pay = useMutation();
  if (status !== 'pending_payment') return null;
  return (
    <div className="no-print mt-6 flex flex-wrap items-end gap-3">
      <label className="text-sm">
        <span className="mb-1 block text-xs text-muted">Pay with</span>
        <select
          className="input"
          value={method}
          onChange={(e) => setMethod(e.target.value as typeof method)}
        >
          {METHODS.map(([v, text]) => (
            <option key={v} value={v}>
              {text}
            </option>
          ))}
        </select>
      </label>
      <button
        className="btn btn-primary"
        disabled={pay.busy}
        onClick={() => pay.run('POST', `/orders/${orderId}/payments`, { method })}
      >
        {pay.busy ? 'Paying…' : 'Pay now'}
      </button>
      <ActionButton
        danger
        label="Cancel order"
        path={`/orders/${orderId}/cancel`}
        confirm="Cancel this order?"
      />
      {pay.error ? <Notice tone="bad">{pay.error}</Notice> : null}
    </div>
  );
}
