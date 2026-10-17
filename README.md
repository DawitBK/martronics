# Martronics

An e-commerce platform: catalog, cart, orders and payments, rebuilt on a modern stack as a
reference implementation of an enterprise-grade service.

> **Status:** the `next` branch holds the rebuild (API first; the storefront follows). `main` still
> holds the original application, tagged `legacy-v1`. The legacy code lives in [`legacy/`](legacy/)
> on this branch until the rebuild reaches parity, and the old API's behaviour and defects are
> written down in [docs/rebuild/legacy-spec.md](docs/rebuild/legacy-spec.md).

## Stack

Node 24, NestJS 12, Drizzle ORM, PostgreSQL 18, Zod contracts that also generate the OpenAPI
document, Vitest, pnpm 10 and Turborepo. Decisions are recorded in [docs/adr](docs/adr).

## What the API does

| Area     | Behaviour                                                                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity | register (always a customer), sign in, short-lived access tokens, rotating refresh tokens with reuse detection, roles `customer`, `manager`, `admin`      |
| Catalog  | categories, sub-categories, products with images; search, filters, sorting, pagination; soft delete; optimistic concurrency                               |
| Cart     | one per user, addressed only through the signed-in identity                                                                                               |
| Orders   | checkout from the cart, prices and stock settled in the database, idempotent, cancel restores stock, staff fulfil                                         |
| Payments | the amount is always the order total; a provider port with a deterministic test provider; declined, unknown and orphaned charges are handled and recorded |
| Platform | problem+json errors, request ids, health and readiness, `/openapi.json`, append-only audit log, transactional outbox                                      |

Money is stored and transported as integer minor units (santim), never as a float.

## Run it

```sh
corepack enable
pnpm install
pnpm db:up                       # PostgreSQL 18 in Docker
cp .env.example .env             # then export its values, or use your own loader
pnpm build
pnpm --filter @martronics/api db:migrate
pnpm --filter @martronics/api start
```

Browse the contract at `http://localhost:3000/openapi.json`.

## Test it

```sh
pnpm lint && pnpm typecheck && pnpm test
DATABASE_URL=postgres://martronics:martronics@localhost:5432/martronics pnpm test:integration
```

The integration suite drives the real HTTP stack against PostgreSQL: it covers the permission
matrix, the checkout and payment flows, an oversell race and idempotent retries.

## Layout

```
apps/api/        the HTTP API (NestJS)
packages/kit/    shared building blocks: env, logging, problem+json, pagination, health, OpenAPI
packages/config/ shared TypeScript and ESLint presets
docs/            ADRs, the enterprise-bar scorecard, the legacy recovery spec
legacy/          the original application (removed when the rebuild reaches parity)
```

Licensed under Apache-2.0.
