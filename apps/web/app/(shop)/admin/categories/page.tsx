import type { Metadata } from 'next';
import { EntityButton } from '@/components/entity-form';
import type { FieldDef } from '@/components/entity-form';
import { ActionButton } from '@/components/form';
import { Empty, PageHeader, Table } from '@/components/ui';
import { api } from '@/lib/server-api';
import type { Category, Page, SubCategory } from '@/lib/types';

export const metadata: Metadata = { title: 'Categories (admin)', robots: { index: false } };

const NAME: FieldDef[] = [{ key: 'name', label: 'Name', required: true, maxLength: 200 }];

export default async function AdminCategoriesPage() {
  const [categories, subs] = await Promise.all([
    api<Page<Category>>('/categories?limit=100'),
    api<Page<SubCategory>>('/sub-categories?limit=100'),
  ]);
  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="A category or sub-category that still has products cannot be removed."
        actions={
          <EntityButton
            primary
            label="New category"
            title="New category"
            fields={NAME}
            createPath="/categories"
          />
        }
      />
      {categories.items.length === 0 ? (
        <Empty>Create a category, then add its sub-categories, before adding products.</Empty>
      ) : (
        <div className="space-y-6">
          {categories.items.map((c) => {
            const mine = subs.items.filter((s) => s.categoryId === c.id);
            return (
              <section key={c.id} className="card">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-4 py-2">
                  <h2 className="font-semibold">{c.name}</h2>
                  <div className="flex gap-2">
                    <EntityButton
                      label="Add sub-category"
                      title={`New sub-category in ${c.name}`}
                      fields={[{ key: 'name', label: 'Name', required: true, maxLength: 200 }]}
                      extra={{ categoryId: c.id }}
                      createPath="/sub-categories"
                    />
                    <EntityButton
                      label="Rename"
                      title={`Rename ${c.name}`}
                      fields={NAME}
                      record={c as unknown as Record<string, unknown> & { version: number }}
                      createPath="/categories"
                      updatePath={`/categories/${c.id}`}
                    />
                    <ActionButton
                      label="Remove"
                      method="DELETE"
                      path={`/categories/${c.id}`}
                      danger
                      confirm={`Remove the category ${c.name}?`}
                    />
                  </div>
                </div>
                {mine.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted">No sub-categories yet.</p>
                ) : (
                  <Table head={['Sub-category', '']}>
                    {mine.map((s) => (
                      <tr key={s.id}>
                        <td className="td">{s.name}</td>
                        <td className="td flex justify-end gap-2">
                          <EntityButton
                            label="Rename"
                            title={`Rename ${s.name}`}
                            fields={NAME}
                            record={s as unknown as Record<string, unknown> & { version: number }}
                            createPath="/sub-categories"
                            updatePath={`/sub-categories/${s.id}`}
                          />
                          <ActionButton
                            label="Remove"
                            method="DELETE"
                            path={`/sub-categories/${s.id}`}
                            danger
                            confirm={`Remove ${s.name}?`}
                          />
                        </td>
                      </tr>
                    ))}
                  </Table>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
