import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  makeCategory,
  makeProduct,
  signUp,
  startContext,
  type Fixture,
  type Session,
  type TestContext,
} from './helpers.js';

let ctx: TestContext;
let manager: Session;
let customer: Session;
let fixture: Fixture;

beforeAll(async () => {
  ctx = await startContext();
  manager = await signUp(ctx, 'manager');
  customer = await signUp(ctx);
  fixture = await makeCategory(ctx, manager);
});
afterAll(async () => {
  await ctx.close();
});

describe('who may change the catalog', () => {
  it('lets staff write, and turns everyone else away', async () => {
    const body = { name: `Cat ${randomUUID()}` };
    expect((await ctx.http().post('/api/v1/categories').send(body)).status).toBe(401);
    expect((await ctx.http().post('/api/v1/categories').set(customer.auth).send(body)).status).toBe(
      403,
    );
    const ok = await ctx.http().post('/api/v1/categories').set(manager.auth).send(body);
    expect(ok.status).toBe(201);
  });

  it('lets anyone read categories and sub-categories', async () => {
    const cats = await ctx.http().get('/api/v1/categories?limit=100');
    expect(cats.status).toBe(200);
    expect(cats.body.items.length).toBeGreaterThan(0);
    const sub = await ctx.http().get(`/api/v1/sub-categories?categoryId=${fixture.categoryId}`);
    expect(sub.body.items.map((s: { id: string }) => s.id)).toContain(fixture.subCategoryId);
  });

  it('keeps names unique, ignoring case', async () => {
    const name = `Unique ${randomUUID().slice(0, 6)}`;
    expect(
      (await ctx.http().post('/api/v1/categories').set(manager.auth).send({ name })).status,
    ).toBe(201);
    const dupe = await ctx
      .http()
      .post('/api/v1/categories')
      .set(manager.auth)
      .send({ name: name.toUpperCase() });
    expect(dupe.status).toBe(409);
    expect(dupe.body.code).toBe('name-taken');
  });

  it('refuses to delete a category that still has products', async () => {
    const f = await makeCategory(ctx, manager);
    await makeProduct(ctx, manager, f);
    const del = await ctx.http().delete(`/api/v1/categories/${f.categoryId}`).set(manager.auth);
    expect(del.status).toBe(409);
    expect(del.body.code).toBe('category-in-use');
    const delSub = await ctx
      .http()
      .delete(`/api/v1/sub-categories/${f.subCategoryId}`)
      .set(manager.auth);
    expect(delSub.status).toBe(409);
  });
});

describe('products', () => {
  it('requires the sub-category to belong to the category', async () => {
    const other = await makeCategory(ctx, manager);
    const res = await ctx.http().post('/api/v1/products').set(manager.auth).send({
      name: 'Mismatch',
      description: 'x',
      priceMinor: 100,
      categoryId: fixture.categoryId,
      subCategoryId: other.subCategoryId,
    });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe('category-mismatch');
  });

  it('validates money as integers and rejects unknown fields', async () => {
    const send = (extra: Record<string, unknown>) =>
      ctx
        .http()
        .post('/api/v1/products')
        .set(manager.auth)
        .send({ name: 'X', description: 'y', priceMinor: 100, ...fixture, ...extra });
    expect((await send({ priceMinor: 12.5 })).status).toBe(400);
    expect((await send({ priceMinor: -1 })).status).toBe(400);
    expect((await send({ stock: -1 })).status).toBe(400);
    expect((await send({ ownerId: randomUUID() })).status).toBe(400);
  });

  it('searches, filters, sorts and paginates', async () => {
    const f = await makeCategory(ctx, manager);
    const tag = `zq${randomUUID().slice(0, 8)}`;
    await makeProduct(ctx, manager, f, { name: `${tag} cheap`, priceMinor: 1_000, stock: 5 });
    await makeProduct(ctx, manager, f, { name: `${tag} mid`, priceMinor: 5_000, stock: 0 });
    await makeProduct(ctx, manager, f, { name: `${tag} dear`, priceMinor: 9_000, stock: 3 });

    const all = await ctx.http().get(`/api/v1/products?q=${tag}&sort=priceMinor`);
    expect(all.body.page.total).toBe(3);
    expect(all.body.items.map((p: { priceMinor: number }) => p.priceMinor)).toEqual([
      1_000, 5_000, 9_000,
    ]);

    const desc = await ctx.http().get(`/api/v1/products?q=${tag}&sort=-priceMinor&limit=2`);
    expect(desc.body.items).toHaveLength(2);
    expect(desc.body.items[0].priceMinor).toBe(9_000);
    const page2 = await ctx
      .http()
      .get(`/api/v1/products?q=${tag}&sort=-priceMinor&limit=2&offset=2`);
    expect(page2.body.items).toHaveLength(1);

    const inStock = await ctx.http().get(`/api/v1/products?q=${tag}&inStock=true`);
    expect(inStock.body.page.total).toBe(2);
    const range = await ctx
      .http()
      .get(`/api/v1/products?q=${tag}&minPriceMinor=2000&maxPriceMinor=6000`);
    expect(range.body.page.total).toBe(1);
    const byCategory = await ctx.http().get(`/api/v1/products?categoryId=${f.categoryId}`);
    expect(byCategory.body.page.total).toBe(3);

    expect((await ctx.http().get('/api/v1/products?sort=password')).status).toBe(400);
    expect((await ctx.http().get('/api/v1/products?limit=1000')).status).toBe(400);
    expect((await ctx.http().get('/api/v1/products?minPriceMinor=9&maxPriceMinor=1')).status).toBe(
      400,
    );
  });

  it('treats LIKE wildcards in a search as plain text', async () => {
    const tag = `wc${randomUUID().slice(0, 8)}`;
    await makeProduct(ctx, manager, fixture, { name: `${tag} 100% cotton` });
    await makeProduct(ctx, manager, fixture, { name: `${tag} 1000 cotton` });
    await makeProduct(ctx, manager, fixture, { name: `${tag} a_b` });
    await makeProduct(ctx, manager, fixture, { name: `${tag} axb` });

    // Unescaped, "%" would match both cotton products and "_" would match both a?b products.
    const percent = await ctx.http().get(`/api/v1/products?q=${tag}%20100%25`);
    expect(percent.body.items.map((p: { name: string }) => p.name)).toEqual([`${tag} 100% cotton`]);
    const underscore = await ctx.http().get(`/api/v1/products?q=${tag}%20a_b`);
    expect(underscore.body.items.map((p: { name: string }) => p.name)).toEqual([`${tag} a_b`]);
    const onlyWildcard = await ctx.http().get('/api/v1/products?q=%25');
    expect(onlyWildcard.status).toBe(200);
    expect(
      onlyWildcard.body.items.every((p: { name: string; description: string }) =>
        (p.name + p.description).includes('%'),
      ),
    ).toBe(true);
  });

  it('uses optimistic concurrency and soft delete', async () => {
    const product = await makeProduct(ctx, manager, fixture);
    const ok = await ctx
      .http()
      .patch(`/api/v1/products/${product.id}`)
      .set(manager.auth)
      .send({ version: product.version, priceMinor: 20_000 });
    expect(ok.status).toBe(200);
    expect(ok.body.version).toBe(product.version + 1);

    const stale = await ctx
      .http()
      .patch(`/api/v1/products/${product.id}`)
      .set(manager.auth)
      .send({ version: product.version, priceMinor: 30_000 });
    expect(stale.status).toBe(409);
    expect(stale.body.currentVersion).toBe(product.version + 1);

    expect(
      (await ctx.http().delete(`/api/v1/products/${product.id}`).set(manager.auth)).status,
    ).toBe(204);
    expect((await ctx.http().get(`/api/v1/products/${product.id}`)).status).toBe(404);
    // Soft delete: the row is still there for history and audit.
    const { rows } = await ctx.pool.query('select deleted_at from products where id = $1', [
      product.id,
    ]);
    expect(rows[0].deleted_at).not.toBeNull();
  });

  it('hides archived products from the public but not from staff', async () => {
    const product = await makeProduct(ctx, manager, fixture);
    await ctx
      .http()
      .patch(`/api/v1/products/${product.id}`)
      .set(manager.auth)
      .send({ version: product.version, status: 'archived' });
    expect((await ctx.http().get(`/api/v1/products/${product.id}`)).status).toBe(404);
    expect((await ctx.http().get(`/api/v1/products/${product.id}`).set(customer.auth)).status).toBe(
      404,
    );
    expect((await ctx.http().get(`/api/v1/products/${product.id}`).set(manager.auth)).status).toBe(
      200,
    );
    const asStaff = await ctx
      .http()
      .get('/api/v1/products?status=archived&limit=100')
      .set(manager.auth);
    expect(asStaff.body.items.map((p: { id: string }) => p.id)).toContain(product.id);
    // A customer asking for archived products still only gets active ones.
    const asCustomer = await ctx
      .http()
      .get('/api/v1/products?status=archived&limit=100')
      .set(customer.auth);
    expect(asCustomer.body.items.map((p: { id: string }) => p.id)).not.toContain(product.id);
  });

  it('manages images and accepts only https URLs', async () => {
    const product = await makeProduct(ctx, manager, fixture);
    const bad = await ctx
      .http()
      .post(`/api/v1/products/${product.id}/images`)
      .set(manager.auth)
      .send({ url: 'http://example.test/a.png' });
    expect(bad.status).toBe(400);
    const script = await ctx
      .http()
      .post(`/api/v1/products/${product.id}/images`)
      .set(manager.auth)
      .send({ url: 'javascript:alert(1)' });
    expect(script.status).toBe(400);

    const ok = await ctx
      .http()
      .post(`/api/v1/products/${product.id}/images`)
      .set(manager.auth)
      .send({ url: 'https://example.test/a.png', position: 1 });
    expect(ok.status).toBe(201);
    const list = await ctx.http().get(`/api/v1/products/${product.id}/images`);
    expect(list.body).toHaveLength(1);
    expect((await ctx.http().get(`/api/v1/products/${product.id}`)).body.images[0].url).toBe(
      'https://example.test/a.png',
    );
    expect(
      (
        await ctx
          .http()
          .delete(`/api/v1/products/${product.id}/images/${ok.body.id}`)
          .set(manager.auth)
      ).status,
    ).toBe(204);
  });

  it('writes an audit row for every change', async () => {
    const product = await makeProduct(ctx, manager, fixture);
    const { rows } = await ctx.pool.query(
      `select action, actor from audit_log where entity_type = 'product' and entity_id = $1`,
      [product.id],
    );
    expect(rows).toEqual([{ action: 'product.created', actor: manager.id }]);
  });
});
