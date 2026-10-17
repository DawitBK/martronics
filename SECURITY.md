# Security policy

## Reporting a vulnerability

Please report security issues privately through GitHub:
**Security tab > Report a vulnerability** on this repository
(<https://github.com/DawitBK/martronics/security/advisories/new>).

Do not open a public issue for a vulnerability. Include what you found, how to reproduce it and
the affected version or commit. You can expect an acknowledgement within a few days.

## Scope and status

This is the `next` rebuild of Martronics. The code on `main` until the rebuild lands is the legacy
application (tag `legacy-v1`), which is **not** maintained and has known security defects
(see [docs/rebuild/legacy-spec.md](docs/rebuild/legacy-spec.md)).

Controls that exist in the API today: default-deny authorization with roles, argon2id password
hashing, rotating refresh tokens with reuse detection, server-side prices and amounts, an
append-only audit log, strict input validation. Controls still to do (rate limiting on sign-in,
account lockout, email verification, MFA, a real payment gateway) are listed honestly in the
[enterprise bar](docs/enterprise-bar.md).

## Practices

- No secrets in the repository; CI runs gitleaks on every push.
- Workflow permissions are read-only by default, and third-party actions are pinned by commit SHA.
- Dependencies are locked (`pnpm-lock.yaml`) and installed with `--frozen-lockfile`.
