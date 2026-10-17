'use client';

import { useState } from 'react';
import { ActionButton, Field, useMutation } from '@/components/form';
import { Notice } from '@/components/ui';
import type { ProductImage } from '@/lib/types';

export function Images({ productId, images }: { productId: string; images: ProductImage[] }) {
  const [url, setUrl] = useState('');
  const [position, setPosition] = useState(String(images.length));
  const m = useMutation();
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const valid =
    url.startsWith('https://') && Number.isInteger(Number(position)) && Number(position) >= 0;

  return (
    <section aria-label="Images">
      <h2 className="mb-2 text-sm font-semibold">Images</h2>
      {sorted.length === 0 ? (
        <p className="mb-3 text-sm text-muted">No images yet. The shop shows an initial instead.</p>
      ) : null}
      <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {sorted.map((img) => (
          <li key={img.id} className="card overflow-hidden">
            <img
              src={img.url}
              alt=""
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
            <div className="flex items-center justify-between gap-2 p-2 text-xs">
              <span className="text-muted">#{img.position}</span>
              <ActionButton
                label="Remove"
                method="DELETE"
                path={`/products/${productId}/images/${img.id}`}
                danger
                confirm="Remove this image?"
              />
            </div>
          </li>
        ))}
      </ul>
      <form
        className="card grid gap-3 p-4 sm:grid-cols-[1fr_6rem_auto] sm:items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!valid) return;
          const r = await m.run('POST', `/products/${productId}/images`, {
            url: url.trim(),
            position: Number(position),
          });
          if (r.ok) {
            setUrl('');
            setPosition(String(images.length + 1));
          }
        }}
      >
        <Field label="Image address (https)" error={m.fieldErrors['url']}>
          <input
            className="input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            required
          />
        </Field>
        <Field label="Position">
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </Field>
        <button className="btn btn-primary" disabled={m.busy || !valid}>
          Add image
        </button>
      </form>
      {m.error ? (
        <div className="mt-2">
          <Notice tone="bad">{m.error}</Notice>
        </div>
      ) : null}
    </section>
  );
}
