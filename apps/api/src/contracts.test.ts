import { describe, expect, it } from 'vitest';
import { registerSchema } from './auth/auth.contract.js';
import { createProductSchema, listProductsQuerySchema } from './catalog/catalog.contract.js';
import { openApiDocument } from './openapi.js';

describe('contracts', () => {
  it('never accepts a role at registration', () => {
    const base = { email: 'a@b.test', password: 'x'.repeat(12), firstName: 'A', lastName: 'B' };
    expect(registerSchema.safeParse(base).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, role: 'admin' }).success).toBe(false);
  });

  it('normalises the email', () => {
    const parsed = registerSchema.parse({
      email: '  Mixed.Case@Example.TEST ',
      password: 'x'.repeat(12),
      firstName: 'A',
      lastName: 'B',
    });
    expect(parsed.email).toBe('mixed.case@example.test');
  });

  it('stores money as whole minor units', () => {
    const product = {
      name: 'n',
      description: 'd',
      categoryId: crypto.randomUUID(),
      subCategoryId: crypto.randomUUID(),
    };
    expect(createProductSchema.safeParse({ ...product, priceMinor: 100 }).success).toBe(true);
    expect(createProductSchema.safeParse({ ...product, priceMinor: 1.5 }).success).toBe(false);
  });

  it('only sorts by whitelisted fields', () => {
    expect(listProductsQuerySchema.safeParse({ sort: '-priceMinor,name' }).success).toBe(true);
    expect(listProductsQuerySchema.safeParse({ sort: 'passwordHash' }).success).toBe(false);
  });
});

describe('OpenAPI document', () => {
  const doc = openApiDocument() as {
    paths: Record<string, Record<string, { operationId: string; security?: unknown }>>;
  };
  const operations = Object.values(doc.paths).flatMap((m) => Object.values(m));

  it('has a unique operation id per route', () => {
    const ids = operations.map((o) => o.operationId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThanOrEqual(37);
  });

  it('marks every non-public route as needing a bearer token', () => {
    const open = new Set([
      'register',
      'login',
      'refresh',
      'logout',
      'listCategories',
      'getCategory',
      'listSubCategories',
      'getSubCategory',
      'listProducts',
      'getProduct',
      'listProductImages',
    ]);
    for (const op of operations) {
      expect(op.security !== undefined, op.operationId).toBe(!open.has(op.operationId));
    }
  });
});
