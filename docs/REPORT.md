# CopiPilot — Final Deliverable Report

> Written 2026-10-11 at completion of the build. Companion docs: `AUDIT.md` (reference audit),
> `CONCEPT.md` (frame), `PLAN.md` (architecture), `DEPLOY.md` (aaPanel production guide).

## 1. What was delivered

**CopiPilot** — a premium investment platform: a marketing site, a client dashboard with a real
money lifecycle (deposits, withdrawals, investments), and a full role-based admin CMS on
PostgreSQL. Built to the structure and experience of the reference site `superflycapital.com`
(structure only — original code, copy, and branding), restyled in the gold/black premium
identity, on an original implementation.

The reference is a WordPress **lead-generation funnel** (no accounts, no backend, external broker
affiliate links). CopiPilot is the operable version: real accounts, real auth, real content
pipeline, real audit trail.

## 2. Verification results (all green, 2026-10-11)

| Gate | Result |
|---|---|
| `pnpm typecheck` | 0 errors |
| `pnpm test` | **123/123 tests, 12 files** |
| `pnpm build` | clean — **52 routes** (Next 16.4, Turbopack) |
| `pnpm db:seed` | idempotent — 20 settings, 13 nav items, 8 homepage sections, 4 strategies, 3 testimonials, 6 FAQs, 3 blog categories + 3 posts, 2 legal pages, demo client |
| Live smoke (`next start` :3400) | 10/10 public routes HTTP 200 |

## 3. Architecture

- **Stack:** Next.js 16.4 · React 19.3 · TypeScript (strict) · Tailwind 4 · PostgreSQL 16 ·
  Prisma 7.10 (`@prisma/adapter-pg`) · Zod 4 · Vitest 5 · pnpm.
- **Auth:** custom revocable DB sessions — bcrypt-hashed passwords, 256-bit opaque tokens
  (SHA-256 hash stored), `httpOnly` `SameSite=Lax` cookies (`cp_admin` / `cp_user`), rate-limited
  login/register/contact, origin checks, password reset with hashed expiring tokens.
- **RBAC:** 4 admin roles (SUPER_ADMIN, CONTENT_ADMIN, SUPPORT_ADMIN, FINANCE_ADMIN) × 15
  permissions in a single matrix (`lib/rbac.ts`); every admin page and every admin server action
  calls `requirePermission(perm)`; sidebar is permission-filtered; denied access is surfaced
  (`/admin?error=forbidden` banner).
- **Finance:** deposits/withdrawals/investments are request → review → approve/reject flows;
  every money event writes an immutable `Transaction` ledger row and a user `Notification`;
  portfolio math centralized in `lib/finance.ts` (`getPortfolioBalances`).
- **Content:** strategies, blog (posts/categories/tags), FAQs, testimonials, stats, homepage
  sections, navigation, pages, media, settings — all CMS-managed with Draft/Publish status and
  `revalidatePath` on publish. Public reads only ever see PUBLISHED rows.
- **Audit:** every admin mutation appends an `AuditLog` row (actor, action, entity, before/after
  JSON, IP), browsable in `/admin/audit`.
- **SEO:** DB-driven per-page metadata, dynamic `sitemap.xml` + `robots.txt`, JSON-LD
  Organization, security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy)
  set in `next.config.ts`.

## 4. Route inventory (52)

- **Public:** `/`, `/about`, `/strategies`, `/strategies/[slug]`, `/calculator`, `/blog`,
  `/blog/[slug]`, `/faq`, `/contact`, `/login`, `/register`, `/forgot-password`,
  `/reset-password`, `/[slug]` (CMS pages), `sitemap.xml`, `robots.txt`.
- **Client:** `/dashboard` + investments, deposits, withdrawals, transactions, notifications,
  settings.
- **Admin:** `/admin/login` + overview, strategies, calculator, blog, faqs, testimonials, stats,
  homepage, pages (+ new/[id]), navigation, media, messages, users, investments, deposits,
  withdrawals, team, settings, audit.
- **API:** `auth/*` (login, logout, register, forgot/reset password), `contact`.

## 5. Demo accounts (seed)

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@copipilot.com` | `Work@3428` |
| Client | `client@copipilot.com` | `Work@3428` |

**Rotate both before any public deployment** (or override via `ADMIN_PASSWORD` /
`DEMO_USER_PASSWORD` at seed time).

## 6. Compliance posture (read before going live)

This vertical — managed investments, deposits/withdrawals, advertised returns — is **regulated in
most jurisdictions**. The build ships defensible: disclaimers and risk notices throughout, no
guaranteed-return language, calculator marked "* Results are estimates only", legal pages with
reviewable baseline copy. But the operator owns the legal call. Two engineering gates remain
before real money:

1. **Money is `Float` in the schema** — migrate to `Decimal`/integer minor units
   (`prisma/schema.prisma` + `lib/finance.ts`) before real deposits.
2. **Rate limits are in-memory** — fine for a single PM2 instance; move to a shared store
   (Redis) if you scale horizontally.

## 7. Known limitations / out of scope

- No real payment rails — deposits record intent; the operator settles off-platform.
- Email delivery is pluggable but off by default (reset tokens are stored/logged).
- No live market data or broker integration.
- No multi-tenant support.

## 8. Run it

```bash
pnpm install
pnpm db:generate && pnpm db:migrate && pnpm db:seed
pnpm dev          # http://localhost:3400
```

Production path: `docs/DEPLOY.md` (aaPanel + PM2 + Nginx + TLS).

## 9. Remaining work

- [ ] `git init` + first commit + push (repo target: Henry's call)
- [ ] Responsive sweep 1920→375px + a11y/perf pass
- [ ] Decimal-money migration + legal review before real deposits
- [ ] Optional: real SMTP, Redis rate limiting, S3 media storage