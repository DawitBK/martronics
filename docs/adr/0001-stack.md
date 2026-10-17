# ADR-0001: Stack

**Status:** accepted

Node 24, NestJS 12 (modular monolith), Drizzle ORM, PostgreSQL 18, Zod for every contract, Vitest.
It is the same stack as the other services in this programme, so patterns and the shared `kit`
carry over. PostgreSQL 18 gives a built-in `uuidv7()` (time-ordered ids, good index locality).
The old app used Express 5 and Sequelize; both are replaced because Sequelize hid the SQL that the
stock and payment logic now depends on being exact.

**Rejected:** staying on Sequelize (opaque transactions and locking), a microservice split (one
team, one database, no scaling pressure that justifies it).
