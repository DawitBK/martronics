'use client';

import { useState } from 'react';
import { Field, Modal, useMutation } from '@/components/form';
import { Notice } from '@/components/ui';
import { parseMoney, toInput } from '@/lib/format';
import type { Category, Product, SubCategory } from '@/lib/types';

interface FormProps {
  categories: Category[];
  subCategories: SubCategory[];
  product?: Product;
  onDone: () => void;
}

function ProductForm({ categories, subCategories, product, onDone }: FormProps) {
  const [f, setF] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: toInput(product?.priceMinor ?? 0),
    stock: String(product?.stock ?? 0),
    categoryId: product?.categoryId ?? categories[0]?.id ?? '',
    subCategoryId: product?.subCategoryId ?? '',
    status: product?.status ?? 'active',
  });
  const m = useMutation();
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: e.target.value });
  const subs = subCategories.filter((s) => s.categoryId === f.categoryId);
  const subId = subs.some((s) => s.id === f.subCategoryId) ? f.subCategoryId : (subs[0]?.id ?? '');
  const price = parseMoney(f.price);
  const stock = Number(f.stock);
  const valid =
    price !== null &&
    Number.isInteger(stock) &&
    stock >= 0 &&
    subId !== '' &&
    f.name.trim() !== '' &&
    f.description.trim() !== '';

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid || price === null) return;
        const body = {
          name: f.name.trim(),
          description: f.description.trim(),
          priceMinor: price,
          stock,
          categoryId: f.categoryId,
          subCategoryId: subId,
        };
        const r = product
          ? await m.run('PATCH', `/products/${product.id}`, {
              version: product.version,
              ...body,
              status: f.status,
            })
          : await m.run('POST', '/products', body);
        if (r.ok) onDone();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Name" error={m.fieldErrors['name']}>
            <input
              className="input"
              value={f.name}
              onChange={set('name')}
              required
              maxLength={200}
            />
          </Field>
        </div>
        <Field label="Category" error={m.fieldErrors['categoryId']}>
          <select className="input" value={f.categoryId} onChange={set('categoryId')} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Sub-category"
          error={m.fieldErrors['subCategoryId']}
          hint={subs.length === 0 ? 'Add a sub-category to this category first' : undefined}
        >
          <select className="input" value={subId} onChange={set('subCategoryId')} required>
            {subs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Price"
          error={price === null ? 'Enter an amount like 120.50' : m.fieldErrors['priceMinor']}
        >
          <input
            className="input"
            inputMode="decimal"
            value={f.price}
            onChange={set('price')}
            required
          />
        </Field>
        <Field label="Stock" error={m.fieldErrors['stock']}>
          <input
            className="input"
            type="number"
            min={0}
            value={f.stock}
            onChange={set('stock')}
            required
          />
        </Field>
        {product ? (
          <Field label="Status" hint="Archived products disappear from the shop">
            <select className="input" value={f.status} onChange={set('status')}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
        ) : null}
      </div>
      <Field label="Description" error={m.fieldErrors['description']}>
        <textarea
          className="input min-h-28 py-2"
          value={f.description}
          onChange={set('description')}
          required
          maxLength={5000}
        />
      </Field>
      {m.error ? <Notice tone="bad">{m.error}</Notice> : null}
      <div className="flex justify-end gap-2">
        <button type="button" className="btn" onClick={onDone}>
          Cancel
        </button>
        <button className="btn btn-primary" disabled={m.busy || !valid}>
          {product ? 'Save changes' : 'Create product'}
        </button>
      </div>
    </form>
  );
}

export function NewProduct({
  categories,
  subCategories,
}: {
  categories: Category[];
  subCategories: SubCategory[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => setOpen(true)}
        disabled={categories.length === 0 || subCategories.length === 0}
      >
        New product
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="New product" wide>
        <ProductForm
          categories={categories}
          subCategories={subCategories}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}

export function EditProduct({
  product,
  categories,
  subCategories,
}: { product: Product } & Omit<FormProps, 'product' | 'onDone'>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}>
        Edit details
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Edit ${product.name}`} wide>
        <ProductForm
          product={product}
          categories={categories}
          subCategories={subCategories}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
