import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { parseEnv } from '@martronics/kit';
import pg from 'pg';
import request from 'supertest';
import { envSchema } from '../src/config.js';
import { createApp } from '../src/create-app.js';
import type { PaymentProvider } from '../src/orders/payment-provider.js';

export const PASSWORD = 'correct horse battery staple';

export interface TestContext {
  app: INestApplication;
  pool: pg.Pool;
  http: () => ReturnType<typeof request>;
  close: () => Promise<void>;
}

export interface Session {
  id: string;
  email: string;
  token: string;
  refreshToken: string;
  auth: { Authorization: string };
}

export async function startContext(paymentProvider?: PaymentProvider): Promise<TestContext> {
  const databaseUrl = process.env['DATABASE_URL']!;
  const env = parseEnv(envSchema, {
    ...process.env,
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret-test-secret-test-secret-123456',
  });
  const app = await createApp(env, { paymentProvider });
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 2 });
  return {
    app,
    pool,
    http: () => request(app.getHttpServer()),
    close: async () => {
      await app.close();
      await pool.end();
    },
  };
}

/** Register through the API, optionally promote through SQL (the API never lets anyone self-promote), then sign in. */
export async function signUp(
  ctx: TestContext,
  role: 'customer' | 'manager' | 'admin' = 'customer',
): Promise<Session> {
  const email = `${randomUUID()}@example.test`;
  const reg = await ctx.http().post('/api/v1/auth/register').send({
    email,
    password: PASSWORD,
    firstName: 'Test',
    lastName: 'User',
  });
  if (reg.status !== 201)
    throw new Error(`register failed: ${reg.status} ${JSON.stringify(reg.body)}`);
  if (role !== 'customer') {
    await ctx.pool.query('update users set role = $1 where email = $2', [role, email]);
  }
  return signIn(ctx, email);
}

export async function signIn(ctx: TestContext, email: string): Promise<Session> {
  const res = await ctx.http().post('/api/v1/auth/login').send({ email, password: PASSWORD });
  if (res.status !== 200)
    throw new Error(`login failed: ${res.status} ${JSON.stringify(res.body)}`);
  return {
    id: res.body.user.id,
    email,
    token: res.body.accessToken,
    refreshToken: res.body.refreshToken,
    auth: { Authorization: `Bearer ${res.body.accessToken}` },
  };
}

export interface Fixture {
  categoryId: string;
  subCategoryId: string;
}

export async function makeCategory(ctx: TestContext, staff: Session): Promise<Fixture> {
  const tag = randomUUID().slice(0, 8);
  const cat = await ctx
    .http()
    .post('/api/v1/categories')
    .set(staff.auth)
    .send({ name: `Cat ${tag}` });
  const sub = await ctx
    .http()
    .post('/api/v1/sub-categories')
    .set(staff.auth)
    .send({ categoryId: cat.body.id, name: `Sub ${tag}` });
  return { categoryId: cat.body.id, subCategoryId: sub.body.id };
}

export async function makeProduct(
  ctx: TestContext,
  staff: Session,
  fixture: Fixture,
  overrides: Record<string, unknown> = {},
) {
  const res = await ctx
    .http()
    .post('/api/v1/products')
    .set(staff.auth)
    .send({
      name: `Product ${randomUUID().slice(0, 8)}`,
      description: 'A product for tests',
      priceMinor: 12_050,
      stock: 10,
      ...fixture,
      ...overrides,
    });
  if (res.status !== 201)
    throw new Error(`product failed: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body as {
    id: string;
    name: string;
    version: number;
    stock: number;
    priceMinor: number;
  };
}
