# CopiPilot

A premium investment-platform website **and** admin CMS — built to the structure and user
experience of the reference site `superflycapital.com` (structure only; original code, copy,
and branding), rebranded as **CopiPilot** with a gold/black premium identity, on an original
implementation with a real database, real auth, and a full CMS.

**Status:** built. Public site, client dashboard, admin CMS, RBAC, seed, tests, and deployment
guide all in place (2026-10-11).

```
docs/
  AUDIT.md    audit of the reference site (routes, sections, claims, compliance flags)
  PLAN.md     stack, routes, data model, security, build order
  CONCEPT.md  the product frame
  DEPLOY.md   aaPanel / production deployment guide
  REPORT.md   final deliverable report (written at completion)
```

## What this is

- **Public site** — Home, About, Strategies (+ detail), Investment Calculator, Blog (+ detail),
  FAQ, Contact, Login/Register, password reset, legal pages (CMS-backed `/[slug]`).
- **Client dashboard** — portfolio overview, investments, deposits, withdrawals, transactions,
  notifications, profile settings. Money moves are validated, rate-limited, and recorded as an
  immutable transaction ledger.
- **Admin CMS** — every meaningful word, strategy, price, blog post, FAQ, testimonial, stat,
  homepage section, menu item, page, media file, and setting is editable from `/admin`, with
  role-based access control and a full audit log.
- **Stack** — Next.js 16 · React 19 · TypeScript (strict) · Tailwind 4 · PostgreSQL 16 · Prisma 7
  · Zod 4 · Vitest.
- **Security** — bcrypt-hashed passwords, revocable DB-backed session tokens in httpOnly cookies,
  RBAC permission matrix, rate limiting on auth + contact, validated uploads, origin checks,
  audit logging.

## Quickstart

```bash
pnpm install
# .env: DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_SITE_URL (see .env.example)
pnpm db:generate
pnpm db:migrate    # apply migrations
pnpm db:seed       # idempotent demo content
pnpm dev           # http://localhost:3400
```

Scripts: `dev` · `build` · `start` · `lint` · `typecheck` · `test` · `db:generate` ·
`db:migrate` · `db:deploy` · `db:seed` · `db:studio`.

### Demo accounts (seed)

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@copipilot.com` | `Work@3428` |
| Client | `client@copipilot.com` | `Work@3428` |

Change these before any public deployment.

## Compliance note

This vertical (managed investments, deposits, withdrawals, advertised returns) is regulated in
most jurisdictions. The seed content ships with **disclaimers and risk notices** and no
guaranteed-return language, but the operator is responsible for legal review before going live.
See `docs/CONCEPT.md` §7.

---

*Kairos :: frame before code.*