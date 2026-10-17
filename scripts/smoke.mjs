/**
 * End-to-end smoke test of the whole stack as people use it: a real PostgreSQL database, the built
 * API, the built web app, and HTTP between them. An administrator stocks the shop, a guest browses
 * it (and search engines are told the right things), a customer buys and pays, the administrator
 * fulfils the order, and every door a customer must not walk through is tried.
 *
 *   DATABASE_URL=postgres://user:pass@host:5432/martronics_smoke node scripts/smoke.mjs
 *
 * Needs a build first. The database name must end in `_smoke`; it is dropped and recreated.
 */
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pg = createRequire(path.join(root, 'apps/api/package.json'))('pg');
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');
const dbName = decodeURIComponent(new URL(databaseUrl).pathname.slice(1));
if (!dbName.endsWith('_smoke'))
  throw new Error(`Refusing to recreate "${dbName}": it must end in _smoke`);

const API_PORT = 3100;
const WEB_PORT = 3101;
const API = `http://127.0.0.1:${API_PORT}`;
const WEB = `http://127.0.0.1:${WEB_PORT}`;
const ADMIN = { email: 'admin@smoke.test', password: 'a long smoke passphrase' };
const CUSTOMER = { email: 'customer@smoke.test', password: 'another long smoke passphrase' };

const children = [];
let failures = 0;
const results = [];

function check(name, ok, detail = '') {
  results.push({ name, ok });
  if (!ok) failures += 1;
  process.stdout.write(
    `${ok ? '  ok  ' : ' FAIL '} ${name}${ok || !detail ? '' : `  -> ${detail}`}\n`,
  );
}

function run(file, args, env) {
  const r = spawnSync(process.execPath, [file, ...args], {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
  if (r.status !== 0) throw new Error(`${file} failed:\n${r.stdout}\n${r.stderr}`);
}

function start(name, file, args, env, cwd = root) {
  const child = spawn(process.execPath, [file, ...args], {
    cwd,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', (d) => (log += d));
  child.stderr.on('data', (d) => (log += d));
  child.on('exit', (code) => {
    if (code && code !== 0 && code !== null)
      process.stdout.write(`${name} exited ${code}\n${log.slice(-2000)}\n`);
  });
  children.push(child);
  return () => log;
}

async function waitFor(url, label, ms = 60_000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${label} did not come up at ${url}`);
}

async function recreateDatabase() {
  const admin = new URL(databaseUrl);
  admin.pathname = '/postgres';
  const client = new pg.Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    await client.query(
      'select pg_terminate_backend(pid) from pg_stat_activity where datname = $1 and pid <> pg_backend_pid()',
      [dbName],
    );
    await client.query(`drop database if exists "${dbName}"`);
    await client.query(`create database "${dbName}"`);
  } finally {
    await client.end();
  }
  const db = new pg.Client({ connectionString: databaseUrl });
  await db.connect();
  try {
    const { rows } = await db.query("select current_setting('server_version_num')::int as v");
    if (rows[0].v < 180000) {
      // PostgreSQL 18 has uuidv7(); an older local server gets an equivalent for the smoke run.
      await db.query(`create or replace function uuidv7() returns uuid language sql volatile as $$
        select encode(set_bit(set_bit(overlay(uuid_send(gen_random_uuid()) placing
          substring(int8send((extract(epoch from clock_timestamp()) * 1000)::bigint) from 3) from 1 for 6), 52, 1), 53, 1), 'hex')::uuid $$`);
    }
  } finally {
    await db.end();
  }
}

async function api(method, p, { token, body, headers } = {}) {
  const res = await fetch(`${API}/api/v1${p}`, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : undefined };
}

/** A person's browser: a cookie jar that follows what the web server sets. */
function browser(initial) {
  const jar = new Map(Object.entries(initial));
  const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
  const absorb = (res) => {
    for (const line of res.headers.getSetCookie()) {
      const [pair] = line.split(';');
      const i = pair.indexOf('=');
      jar.set(pair.slice(0, i), pair.slice(i + 1));
    }
  };
  return {
    jar,
    async get(p) {
      const res = await fetch(`${WEB}${p}`, {
        redirect: 'manual',
        headers: { cookie: cookieHeader() },
      });
      absorb(res);
      return {
        status: res.status,
        location: res.headers.get('location'),
        text: await res.text(),
        res,
      };
    },
    async bff(method, p, body, headers = {}) {
      const res = await fetch(`${WEB}/bff${p}`, {
        method,
        headers: {
          cookie: cookieHeader(),
          ...(body ? { 'content-type': 'application/json' } : {}),
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      absorb(res);
      const text = await res.text();
      return { status: res.status, json: text ? JSON.parse(text) : undefined };
    },
  };
}

const sessionFor = async (creds) => {
  const r = await api('POST', '/auth/login', { body: creds });
  if (r.status !== 200) throw new Error(`login failed: ${r.status} ${JSON.stringify(r.json)}`);
  return r.json;
};

async function main() {
  process.stdout.write(`Smoke test against ${dbName}\n`);
  await recreateDatabase();
  const apiEnv = {
    DATABASE_URL: databaseUrl,
    JWT_SECRET: randomBytes(32).toString('hex'),
    PORT: String(API_PORT),
    NODE_ENV: 'production',
    LOG_LEVEL: 'warn',
  };
  run('apps/api/dist/db/migrate.js', [], apiEnv);
  run('apps/api/dist/bootstrap-admin.js', [], {
    ...apiEnv,
    ADMIN_EMAIL: ADMIN.email,
    ADMIN_PASSWORD: ADMIN.password,
  });
  start('api', 'apps/api/dist/main.js', [], apiEnv);
  await waitFor(`${API}/health/ready`, 'API');
  const nextBin = path.join(root, 'apps/web/node_modules/next/dist/bin/next');
  start(
    'web',
    nextBin,
    ['start', '--port', String(WEB_PORT), '--hostname', '127.0.0.1'],
    { API_URL: API, NODE_ENV: 'production', SITE_URL: WEB },
    path.join(root, 'apps/web'),
  );
  await waitFor(`${WEB}/login`, 'web app');

  // --- the front door: the shop is public, the rest is not
  const guest = browser({});
  const home = await guest.get('/');
  check('the shop front page is public', home.status === 200 && home.text.includes('Martronics'));
  const products0 = await guest.get('/products');
  check('the catalogue is public', products0.status === 200);
  const checkout0 = await guest.get('/checkout');
  check(
    'checkout without a session redirects to sign-in and remembers where to return',
    checkout0.status === 307 && checkout0.location?.includes('/login?next=%2Fcheckout'),
    `${checkout0.status} ${checkout0.location}`,
  );
  const admin0 = await guest.get('/admin/products');
  check('the admin area needs a session', admin0.status === 307, `${admin0.status}`);
  const guestRead = await guest.bff('GET', '/products');
  check('a guest may read the catalogue through the API door', guestRead.status === 200);
  const guestCart = await guest.bff('GET', '/cart');
  check('a guest may not read a cart through the API door', guestCart.status === 401);
  const guestWrite = await guest.bff('POST', '/products', { name: 'x' });
  check('a guest may not write through the API door', guestWrite.status === 401);

  // --- the administrator stocks the shop; only the refresh cookie survives, the proxy renews the rest
  const adminSession = await sessionFor(ADMIN);
  const a = browser({ mt_refresh: adminSession.refreshToken });
  const adminHome = await a.get('/admin/products');
  check(
    'an expired access token is renewed by the proxy',
    adminHome.status === 200 && a.jar.has('mt_access'),
    `${adminHome.status}`,
  );
  const category = await a.bff('POST', '/categories', { name: 'Phones' });
  check('create a category', category.status === 201, JSON.stringify(category.json));
  const sub = await a.bff('POST', '/sub-categories', {
    categoryId: category.json?.id,
    name: 'Smartphones',
  });
  check('create a sub-category', sub.status === 201, JSON.stringify(sub.json));
  const product = await a.bff('POST', '/products', {
    name: 'Smoke Phone <b>X</b>',
    description: 'A phone made for the smoke test.\nSecond line.',
    priceMinor: 120_50,
    stock: 5,
    categoryId: category.json?.id,
    subCategoryId: sub.json?.id,
  });
  check('create a product', product.status === 201, JSON.stringify(product.json));
  const image = await a.bff('POST', `/products/${product.json?.id}/images`, {
    url: 'https://images.example.test/phone.jpg',
    position: 0,
  });
  check('attach an image', image.status === 201, JSON.stringify(image.json));
  for (const p of [
    '/admin/categories',
    '/admin/orders',
    '/admin/users',
    `/admin/products/${product.json?.id}`,
  ]) {
    const r = await a.get(p);
    check(`admin page ${p} renders`, r.status === 200, `${r.status}`);
  }

  // --- the public shop shows it, and search engines are told the right things
  const list = await guest.get('/products');
  check('the product appears in the catalogue', list.text.includes('Smoke Phone'));
  const page = await guest.get(`/products/${product.json?.id}`);
  check('the product page shows the price', page.status === 200 && page.text.includes('120.50'));
  check(
    'the product page carries Product structured data',
    page.text.includes('application/ld+json') && page.text.includes('"@type":"Product"'),
  );
  check('product text is escaped, never injected as markup', !page.text.includes('<b>X</b>'));
  const search = await guest.get('/products?q=Smoke');
  check('search finds the product', search.text.includes('Smoke Phone'));
  const missing = await guest.get('/products/00000000-0000-4000-8000-000000000000');
  check('an unknown product is a 404', missing.status === 404, `${missing.status}`);
  const sitemap = await guest.get('/sitemap.xml');
  check('the sitemap lists the product', sitemap.text.includes(`/products/${product.json?.id}`));
  const robots = await guest.get('/robots.txt');
  check(
    'robots.txt keeps private pages out of search',
    robots.text.includes('Disallow: /admin') && robots.text.includes('Sitemap:'),
  );

  // --- a customer buys it
  const reg = await api('POST', '/auth/register', {
    body: { ...CUSTOMER, firstName: 'Cora', lastName: 'Customer' },
  });
  check('a customer registers', reg.status === 201, JSON.stringify(reg.json));
  const customerSession = await sessionFor(CUSTOMER);
  const c = browser({ mt_refresh: customerSession.refreshToken });
  const put = await c.bff('PUT', `/cart/items/${product.json?.id}`, { quantity: 2 });
  check('put two in the cart', put.status === 200, JSON.stringify(put.json));
  const cartPage = await c.get('/cart');
  check('the cart page renders', cartPage.status === 200);
  const checkoutPage = await c.get('/checkout');
  check(
    'checkout shows the server price',
    checkoutPage.status === 200 && checkoutPage.text.includes('241.00'),
  );
  const key = 'smoke-order-1';
  const o1 = await c.bff('POST', '/orders', {}, { 'idempotency-key': key });
  const o2 = await c.bff('POST', '/orders', {}, { 'idempotency-key': key });
  check(
    'checkout places an order from the cart',
    o1.status === 201 && o1.json?.totalMinor === 241_00,
    JSON.stringify(o1.json),
  );
  check('the same idempotency key replays the same order', o2.json?.id === o1.json?.id);
  const pay = await c.bff('POST', `/orders/${o1.json?.id}/payments`, { method: 'card' });
  check(
    'payment succeeds',
    pay.status === 201 && pay.json?.status === 'succeeded',
    JSON.stringify(pay.json),
  );
  const orderPage = await c.get(`/orders/${o1.json?.id}?paid=1`);
  check('the order page confirms payment', orderPage.text.includes('Payment received'));
  const ordersList = await c.get('/orders');
  check('the order is in the history', ordersList.text.includes(o1.json?.number));
  const after = await guest.bff('GET', `/products/${product.json?.id}`);
  check('stock fell from 5 to 3', after.json?.stock === 3, JSON.stringify(after.json?.stock));
  const cartAfter = await c.bff('GET', '/cart');
  check('the cart was emptied by checkout', cartAfter.json?.items?.length === 0);

  // --- what a customer cannot do
  const cAdmin = await c.get('/admin/products');
  check(
    'a customer is sent away from the admin area',
    cAdmin.status === 307 && !cAdmin.location?.includes('/admin'),
    `${cAdmin.status} ${cAdmin.location}`,
  );
  const cWrite = await c.bff('POST', '/products', {
    name: 'x',
    description: 'x',
    priceMinor: 1,
    categoryId: category.json?.id,
    subCategoryId: sub.json?.id,
  });
  check('the API refuses a customer creating a product', cWrite.status === 403, `${cWrite.status}`);
  const cRole = await c.bff('PATCH', `/users/${customerSession.user.id}/role`, { role: 'admin' });
  check('a customer cannot promote themselves', cRole.status === 403, `${cRole.status}`);
  const cOver = await c.bff('PUT', `/cart/items/${product.json?.id}`, { quantity: 9 });
  const cOverOrder = await c.bff('POST', '/orders', {}, { 'idempotency-key': 'smoke-order-2' });
  check(
    'a cart larger than the stock cannot be bought',
    cOver.status !== 200 || cOverOrder.status === 409 || cOverOrder.status === 422,
    `${cOver.status}/${cOverOrder.status}`,
  );

  // --- the administrator fulfils it
  const fulfil = await a.bff('POST', `/orders/${o1.json?.id}/fulfill`, {});
  check(
    'the administrator fulfils the paid order',
    fulfil.status === 200 && fulfil.json?.status === 'fulfilled',
    JSON.stringify(fulfil.json),
  );
  const done = await c.get(`/orders/${o1.json?.id}`);
  check('the customer sees it fulfilled', done.text.includes('fulfilled'));
}

try {
  await main();
} catch (e) {
  failures += 1;
  process.stdout.write(`\nSmoke test crashed: ${e.stack ?? e}\n`);
} finally {
  for (const c of children) c.kill();
  process.stdout.write(`\n${results.filter((r) => r.ok).length}/${results.length} checks passed\n`);
  process.exit(failures ? 1 : 0);
}
