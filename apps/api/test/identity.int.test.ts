import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthService } from '../src/auth/auth.service.js';
import { PASSWORD, signUp, startContext, type TestContext } from './helpers.js';

let ctx: TestContext;
const run = randomUUID().slice(0, 8);
beforeAll(async () => {
  ctx = await startContext();
});
afterAll(async () => {
  await ctx.close();
});

describe('registration and login', () => {
  it('creates a customer and never returns the password hash', async () => {
    const res = await ctx
      .http()
      .post('/api/v1/auth/register')
      .send({
        email: `Fresh.${run}@Example.test`,
        password: PASSWORD,
        firstName: 'Fresh',
        lastName: 'User',
      });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe('customer');
    expect(res.body.email).toBe(`fresh.${run}@example.test`);
    expect(JSON.stringify(res.body)).not.toMatch(/password|hash/i);
  });

  it('refuses to let a caller choose a role (the legacy privilege escalation)', async () => {
    const res = await ctx.http().post('/api/v1/auth/register').send({
      email: 'sneaky@example.test',
      password: PASSWORD,
      firstName: 'Sneaky',
      lastName: 'User',
      role: 'admin',
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('validation');
    const { rows } = await ctx.pool.query('select 1 from users where email = $1', [
      'sneaky@example.test',
    ]);
    expect(rows).toHaveLength(0);
  });

  it('rejects a weak password and a duplicate email (case-insensitively)', async () => {
    const weak = await ctx.http().post('/api/v1/auth/register').send({
      email: 'weak@example.test',
      password: 'short',
      firstName: 'W',
      lastName: 'K',
    });
    expect(weak.status).toBe(400);

    await signUp(ctx);
    const first = await ctx
      .http()
      .post('/api/v1/auth/register')
      .send({
        email: `dupe.${run}@example.test`,
        password: PASSWORD,
        firstName: 'D',
        lastName: 'P',
      });
    expect(first.status).toBe(201);
    const second = await ctx
      .http()
      .post('/api/v1/auth/register')
      .send({
        email: `DUPE.${run}@example.test`,
        password: PASSWORD,
        firstName: 'D',
        lastName: 'P',
      });
    expect(second.status).toBe(409);
    expect(second.body.code).toBe('email-taken');
  });

  it('answers an unknown email and a wrong password identically', async () => {
    const user = await signUp(ctx);
    const wrong = await ctx
      .http()
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'definitely not the password' });
    const unknown = await ctx
      .http()
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.test', password: 'definitely not the password' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.detail).toBe(unknown.body.detail);
    expect(wrong.body.code).toBe(unknown.body.code);
  });
});

describe('tokens', () => {
  it('guards every private route by default', async () => {
    const none = await ctx.http().get('/api/v1/me');
    expect(none.status).toBe(401);
    expect(none.type).toBe('application/problem+json');
    const bad = await ctx.http().get('/api/v1/me').set('Authorization', 'Bearer not-a-token');
    expect(bad.status).toBe(401);
    for (const path of ['/api/v1/cart', '/api/v1/orders', '/api/v1/users']) {
      expect((await ctx.http().get(path)).status).toBe(401);
    }
  });

  it('serves the signed-in user and lets them rename themselves with optimistic concurrency', async () => {
    const user = await signUp(ctx);
    const me = await ctx.http().get('/api/v1/me').set(user.auth);
    expect(me.status).toBe(200);
    expect(me.body.id).toBe(user.id);

    const updated = await ctx
      .http()
      .patch('/api/v1/me')
      .set(user.auth)
      .send({ version: me.body.version, firstName: 'Renamed' });
    expect(updated.status).toBe(200);
    expect(updated.body.firstName).toBe('Renamed');
    expect(updated.body.version).toBe(me.body.version + 1);

    const stale = await ctx
      .http()
      .patch('/api/v1/me')
      .set(user.auth)
      .send({ version: me.body.version, firstName: 'Again' });
    expect(stale.status).toBe(409);
    expect(stale.body.code).toBe('version-conflict');
  });

  it('rotates refresh tokens and revokes the whole session when a spent one is replayed', async () => {
    const user = await signUp(ctx);
    const rotated = await ctx
      .http()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: user.refreshToken });
    expect(rotated.status).toBe(200);
    expect(rotated.body.refreshToken).not.toBe(user.refreshToken);

    // The first token is spent. Presenting it again is theft: the new token dies too.
    const replay = await ctx
      .http()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: user.refreshToken });
    expect(replay.status).toBe(401);
    const afterReplay = await ctx
      .http()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: rotated.body.refreshToken });
    expect(afterReplay.status).toBe(401);
  });

  it('logout revokes the session', async () => {
    const user = await signUp(ctx);
    const out = await ctx
      .http()
      .post('/api/v1/auth/logout')
      .send({ refreshToken: user.refreshToken });
    expect(out.status).toBe(204);
    const refresh = await ctx
      .http()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: user.refreshToken });
    expect(refresh.status).toBe(401);
  });
});

describe('roles', () => {
  it('lets only an admin list users and change roles, and never their own', async () => {
    const customer = await signUp(ctx);
    const manager = await signUp(ctx, 'manager');
    const admin = await signUp(ctx, 'admin');

    expect((await ctx.http().get('/api/v1/users').set(customer.auth)).status).toBe(403);
    expect((await ctx.http().get('/api/v1/users').set(manager.auth)).status).toBe(403);
    const list = await ctx.http().get('/api/v1/users?limit=5').set(admin.auth);
    expect(list.status).toBe(200);
    expect(list.body.page.total).toBeGreaterThan(2);
    expect(JSON.stringify(list.body)).not.toMatch(/password|hash/i);

    const promote = await ctx
      .http()
      .patch(`/api/v1/users/${customer.id}/role`)
      .set(admin.auth)
      .send({ role: 'manager' });
    expect(promote.status).toBe(200);
    expect(promote.body.role).toBe('manager');

    const self = await ctx
      .http()
      .patch(`/api/v1/users/${admin.id}/role`)
      .set(admin.auth)
      .send({ role: 'customer' });
    expect(self.status).toBe(422);
    expect(self.body.code).toBe('self-role-change');

    const asCustomer = await ctx
      .http()
      .patch(`/api/v1/users/${manager.id}/role`)
      .set(customer.auth)
      .send({ role: 'admin' });
    // The promoted customer is now a manager, which still may not change roles.
    expect([401, 403]).toContain(asCustomer.status);
  });
});

describe('platform', () => {
  it('reports health and publishes the OpenAPI document without credentials', async () => {
    expect((await ctx.http().get('/health/live')).status).toBe(200);
    const ready = await ctx.http().get('/health/ready');
    expect(ready.status).toBe(200);
    expect(ready.body.checks.database.status).toBe('up');

    const doc = await ctx.http().get('/openapi.json');
    expect(doc.status).toBe(200);
    expect(doc.body.openapi).toBe('3.1.0');
    expect(doc.body.paths['/api/v1/orders'].post.security).toEqual([{ bearerAuth: [] }]);
    expect(doc.body.paths['/api/v1/products'].get.security).toBeUndefined();
  });

  it('keeps the audit log append-only, even for SQL access', async () => {
    const admin = await signUp(ctx, 'admin');
    expect(admin.id).toBeTruthy();
    const { rows } = await ctx.pool.query('select id from audit_log limit 1');
    expect(rows.length).toBe(1);
    await expect(ctx.pool.query('update audit_log set actor = $1', ['x'])).rejects.toThrow(
      /append-only/,
    );
    await expect(ctx.pool.query('delete from audit_log')).rejects.toThrow(/append-only/);
    await expect(ctx.pool.query('truncate audit_log')).rejects.toThrow(/append-only/);
  });
});

describe('the platform administrator', () => {
  it('is in no user list and cannot be changed by anyone else', async () => {
    const admin = await signUp(ctx, 'admin');
    const hidden = await signUp(ctx, 'admin');
    await ctx.pool.query('update users set platform_admin = true where id = $1', [hidden.id]);

    const others = await ctx.http().get('/api/v1/users?limit=100').set(admin.auth);
    expect(others.status).toBe(200);
    expect(others.body.items.some((u: { id: string }) => u.id === hidden.id)).toBe(false);
    expect(others.body.page.total).toBe(others.body.items.length); // the count does not give the hidden account away either

    const change = await ctx
      .http()
      .patch(`/api/v1/users/${hidden.id}/role`)
      .set(admin.auth)
      .send({ role: 'customer' });
    const nobody = await ctx
      .http()
      .patch(`/api/v1/users/${randomUUID()}/role`)
      .set(admin.auth)
      .send({ role: 'customer' });
    expect(change.status).toBe(404);
    expect(nobody.status).toBe(404);
    expect(change.body.title).toBe(nobody.body.title); // the same answer as an id that never existed
    expect(
      (await ctx.pool.query('select role from users where id = $1', [hidden.id])).rows[0].role,
    ).toBe('admin');

    const own = await ctx.http().get('/api/v1/users?limit=100').set(hidden.auth);
    expect(own.body.items.some((u: { id: string }) => u.id === hidden.id)).toBe(true);
  });
});

describe('single sign-on identity and sign-out', () => {
  it('binds the provider id at the first sign-in, then refuses the same email with another id', async () => {
    const auth = ctx.app.get(AuthService);
    const person = await signUp(ctx);
    const sub = `sub-${randomUUID()}`;
    expect((await auth.loginWithVerifiedEmail(person.email, sub)).user.email).toBe(person.email);
    expect(
      (await ctx.pool.query('select sso_subject from users where id = $1', [person.id])).rows[0]
        .sso_subject,
    ).toBe(sub);
    expect((await auth.loginWithVerifiedEmail(person.email, sub)).user.id).toBe(person.id);
    await expect(
      auth.loginWithVerifiedEmail(person.email, `sub-${randomUUID()}`),
    ).rejects.toMatchObject({ status: 401 });
    const other = await signUp(ctx);
    await expect(auth.loginWithVerifiedEmail(other.email, sub)).rejects.toMatchObject({
      status: 401,
    }); // an id belongs to one account
  });

  it("the provider's sign-out ends every session of that person and nobody else's", async () => {
    const auth = ctx.app.get(AuthService);
    const a = await signUp(ctx);
    const b = await signUp(ctx);
    const subA = `sub-${randomUUID()}`;
    const tokensA = await auth.loginWithVerifiedEmail(a.email, subA);
    await auth.loginWithVerifiedEmail(b.email, `sub-${randomUUID()}`);
    expect(await auth.revokeSessionsBySsoSubject(`sub-${randomUUID()}`)).toBe(0); // an id this app never saw: nothing, and no error
    expect(await auth.revokeSessionsBySsoSubject(subA)).toBeGreaterThanOrEqual(2);
    expect(
      (await ctx.http().post('/api/v1/auth/refresh').send({ refreshToken: tokensA.refreshToken }))
        .status,
    ).toBe(401);
    expect(
      (await ctx.http().post('/api/v1/auth/refresh').send({ refreshToken: b.refreshToken })).status,
    ).toBe(200);
  });

  it('the back-channel route is public and refuses a missing or malformed token', async () => {
    expect(
      (await ctx.http().post('/api/v1/auth/backchannel-logout').type('form').send({})).status,
    ).toBe(400);
    expect(
      (
        await ctx
          .http()
          .post('/api/v1/auth/backchannel-logout')
          .type('form')
          .send({ logout_token: 'x'.repeat(30) })
      ).status,
    ).toBeGreaterThanOrEqual(400);
  });
});
