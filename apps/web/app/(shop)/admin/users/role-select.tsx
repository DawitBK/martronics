'use client';

import { useMutation } from '@/components/form';
import { label } from '@/lib/format';
import type { Role } from '@/lib/types';

export function RoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: Role;
  disabled?: boolean;
}) {
  const m = useMutation();
  return (
    <span className="inline-flex flex-col">
      <select
        className="input w-36"
        value={role}
        disabled={disabled || m.busy}
        aria-label="Role"
        onChange={(e) => m.run('PATCH', `/users/${userId}/role`, { role: e.target.value })}
      >
        {(['customer', 'manager', 'admin'] as const).map((r) => (
          <option key={r} value={r}>
            {label(r)}
          </option>
        ))}
      </select>
      {m.error ? <span className="mt-1 max-w-48 text-xs text-bad">{m.error}</span> : null}
    </span>
  );
}
