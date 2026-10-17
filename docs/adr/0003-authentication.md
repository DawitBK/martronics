# ADR-0003: First-party authentication

**Status:** accepted

Customers and staff of this shop sign in with first-party accounts: argon2id (19 MiB, 2 passes),
a 15-minute HS256 access token carrying the role, and an opaque refresh token stored only as a
SHA-256 hash. Refresh tokens rotate on every use and belong to a family: presenting a token that
was already spent revokes the whole family, which turns a stolen token into a forced re-login.
Every route is denied by default (a global guard); a route opens only with `@Public()`.
Unknown email and wrong password answer identically and cost the same (a dummy hash is verified).

A role change takes effect when the access token expires (at most 15 minutes) because the role is
a claim; revoking an account does the same for access tokens and immediately for refresh tokens.
Not yet built: sign-in rate limiting, lockout, email verification, MFA, passkeys.

**Rejected:** sessions in a cookie (the storefront and API will be on different origins), one
long-lived JWT (cannot be revoked).
