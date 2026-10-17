'use client';

import { useState } from 'react';
import { Field, useMutation } from '@/components/form';
import { Notice } from '@/components/ui';
import type { User } from '@/lib/types';

export function AccountForm({ user }: { user: User }) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [saved, setSaved] = useState(false);
  const m = useMutation();
  const changed = firstName.trim() !== user.firstName || lastName.trim() !== user.lastName;
  return (
    <form
      className="card space-y-4 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaved(false);
        const r = await m.run('PATCH', '/me', {
          version: user.version,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        if (r.ok) setSaved(true);
      }}
    >
      <Field label="First name" error={m.fieldErrors['firstName']}>
        <input
          className="input"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          maxLength={100}
        />
      </Field>
      <Field label="Last name" error={m.fieldErrors['lastName']}>
        <input
          className="input"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          maxLength={100}
        />
      </Field>
      {m.error ? <Notice tone="bad">{m.error}</Notice> : null}
      {saved && !m.error ? <Notice tone="good">Saved.</Notice> : null}
      <button className="btn btn-primary" disabled={m.busy || !changed}>
        Save changes
      </button>
    </form>
  );
}
