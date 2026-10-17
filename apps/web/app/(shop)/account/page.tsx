import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { api } from '@/lib/server-api';
import type { User } from '@/lib/types';
import { AccountForm } from './account-form';

export const metadata: Metadata = { title: 'Your account', robots: { index: false } };

export default async function AccountPage() {
  const me = await api<User>('/me');
  return (
    <>
      <PageHeader title="Your account" subtitle={me.email} />
      <div className="max-w-md">
        <AccountForm user={me} />
      </div>
    </>
  );
}
