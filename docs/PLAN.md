# CopiPilot — Implementation Plan & Architecture

> Derived from `AUDIT.md`. This is the build contract: scope, stack, data model, routes,
> security, and the decisions that were made.

## 0. The frame (locked)

**CopiPilot** is an investment platform: a marketing site + client dashboard + content-managed
admin CMS for a managed-investment product, positioned around a blue/navy premium-fintech
identity. **What we take from the reference:** the public marketing structure and journey.
**What we add (net-new, the brief's real emphasis):** PostgreSQL, a complete admin CMS, secure
auth, and a real client finance lifecycle.

## 1. Stack (locked)

| Layer | Choice |
|---|---|
| Framework | **Next.js 16.4** (App Router, RSC, Turbopack) |
| Language | **TypeScript** (strict, `tsc --noEmit`) |
| UI | **React 19.3** + **Tailwind 4** + hand-rolled component library (shadcn-style) |
| Icons | `lucide-react` (brand glyphs inlined — lucide dropped them) |
| Animation | CSS transitions + IntersectionObserver (respects `prefers-reduced-motion`); no heavy lib |
| DB | **PostgreSQL 16** (local `:5433`; `copipilot` + `copipilot_test`) |
| ORM | **Prisma 7.10** + `@prisma/adapter-pg` + migrations |
| Validation | **Zod 4** (shared schemas in `lib/validators.ts`) |
| Auth | Custom revocable DB sessions — `bcryptjs` hashing + 256-bit opaque tokens (SHA-256 hash stored) in **httpOnly** cookies `cp_admin` / `cp_user` |
| Email | Pluggable; password-reset tokens stored/logged (no SMTP required to run) |
| Toasts | `sonner` |
| Media | Local disk store under `public/uploads` (pluggable interface for S3 later) |
| Tests | **Vitest 5** — 123 tests across validators, auth, API routes, tokens, rate-limit, uploads, markdown, form, utils, http, password |

> Auth is **custom, revocable DB-session auth**, not NextAuth — clean ADMIN vs USER separation,
> server-side revocation, no hidden coupling. `AUTH_SECRET` in `.env` signs nothing critical;
> session validity is the DB row.

## 2. Route map (CopiPilot)

### Public
```
/                       Home (all sections DB-driven)
/about                  About
/strategies             Strategy catalog (CMS)
/strategies/[slug]      Strategy detail (CMS)
/calculator             Investment calculator (settings from SiteSetting JSON)
/blog                   Blog listing
/blog/[slug]            Blog post
/faq                    FAQ
/contact                Contact (writes contact_messages, rate-limited)
/login · /register      Client auth
/forgot-password · /reset-password
/[slug]                 CMS-created pages (catch-all, PUBLISHED only)
/dashboard              Client area (auth-gated)
/dashboard/{investments,deposits,withdrawals,transactions,notifications,settings}
not-found (404) · sitemap.xml · robots.txt
```

### Admin CMS (auth-gated under `/admin`)
```
/admin/login            Admin sign-in (rate-limited)
/admin                  Overview (stats, recent messages, recent activity)
/admin/strategies       Strategy catalog manager
/admin/calculator       Calculator settings manager
/admin/blog             Blog posts + categories manager
/admin/faqs             FAQ manager (reorder/enable)
/admin/testimonials     Testimonials manager
/admin/stats            Homepage stat cards manager
/admin/homepage         Homepage sections manager
/admin/pages            Pages manager (CRUD, slug, SEO, publish/unpublish)
/admin/navigation       Navigation manager
/admin/media            Media library (upload/validate/delete/copy URL)
/admin/messages         Contact inbox
/admin/users            Client accounts manager
/admin/investments      Investment requests (approve/reject, credit profit)
/admin/deposits         Deposit requests
/admin/withdrawals      Withdrawal requests
/admin/team             Admin accounts (role assignment)
/admin/settings         Site settings
/admin/audit            Audit log
```

### API (Route Handlers under `/api`)
- `auth/*` — login, logout, register, forgot-password, reset-password
- `contact` — public, rate-limited, honeypot

## 3. Data model (Prisma → PostgreSQL, 24 models)

```
Admin, AdminSession        admins + revocable sessions (role, permissions via matrix)
User, UserSession          clients + sessions (CLIENT | AFFILIATE)
PasswordReset              reset tokens (hashed, expiring)
Strategy                   catalog: slug, name, minInvestment, expectedReturn, riskLevel,
                           status(ACTIVE|INACTIVE|COMING_SOON), features, cta
Investment                 client → strategy: amount, status(PENDING|ACTIVE|COMPLETED|CANCELLED),
                           expectedReturn, startedAt, maturedAt
Deposit, Withdrawal        requests: amount, method, status, admin note
Transaction                immutable ledger: type(DEPOSIT|WITHDRAWAL|INVESTMENT|PROFIT|FEE|
                           REFUND|ADJUSTMENT), status, referenceId
Notification               per-user notices (SYSTEM|INVESTMENT|DEPOSIT|WITHDRAWAL|SECURITY)
BlogPost, BlogCategory, BlogTag, BlogPostTag
Faq, Testimonial, Stat, HomepageSection, NavigationItem, Page, Media, ContactMessage
SiteSetting                key/value JSON (incl. `calculator` settings)
AuditLog                   adminId, action, entity, before/after JSON, ip
```

**Principles:** real relationships + FKs; indexes on hot lookups (`slug`, `status`, `email`,
`tokenHash`); `order` columns for reordering; `status`/`isEnabled` gates; JSON columns only for
genuinely list-shaped content.

## 4. Content pipeline

- Editable entities carry `status` (DRAFT|PUBLISHED) + `publishedAt`.
- **Publish** flips status + `revalidatePath` so the public site reflects it immediately.
- **Public reads only ever see PUBLISHED rows** — enforced in the query layer.

## 5. Security (implemented)

- Passwords: `bcryptjs` (cost 12). Never stored or logged in plaintext.
- Sessions: 256-bit random token (`randomBytes(32)`), **SHA-256 hash stored** in DB; delivered as
  `httpOnly`, `SameSite=Lax` cookie; server-side revocation on logout; expiry checked per request.
- CSRF: `SameSite` cookies + origin checks on API mutations.
- Validation: Zod on **every** server action and API input.
- AuthZ: **RBAC matrix** in `lib/rbac.ts` — 4 roles (SUPER_ADMIN, CONTENT_ADMIN, SUPPORT_ADMIN,
  FINANCE_ADMIN) × 15 permissions; pages and actions both call `requirePermission(perm)`;
  sidebar is permission-filtered; denied access redirects to `/admin?error=forbidden`.
- Rate limiting: in-memory token bucket on login, register, contact, and money-move actions.
- Uploads: MIME + extension + size + dimension validation; randomized filenames; no execution.
- Headers: CSP, HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors via
  `next.config.ts`.
- Secrets: only in `.env` (gitignored); `.env.example` committed with placeholders.
- Errors: typed API errors; no raw DB/stack ever returned to a client.

## 6. SEO

Per-page metadata from DB where CMS-managed; `app/sitemap.ts` (DB-driven) + `app/robots.ts`;
JSON-LD `Organization` on home; admin-editable SEO defaults in `site_settings`.

## 7. Compliance (non-negotiable for this vertical)

- **Regulated activity** — deposits + advertised returns. Operator owns legal review.
- All performance figures are **CMS-controlled**, labelled **illustrative / past performance**,
  never "guaranteed" or "verified" unless a real verified account is linked.
- Persistent **risk notice** in the footer on every page.
- Calculator carries `* Results are estimates only` + risk line.
- Ship four legal pages (Risk Disclosure, Terms, Privacy, Cookie Policy) with **reviewable**
  baseline copy, clearly marked "review by counsel".
- Money is `Float` today (flagged): **move to `Decimal`/integer minor units before real money
  moves.**

## 8. Build order (as executed)

1. **Scaffold** — Next 16 + TS + Tailwind; blue/navy design tokens; fonts; layout.
2. **Public site** — component library + all sections/pages wired to seed data → DB.
3. **DB** — Prisma schema (24 models), migration `20261011064713_init`, idempotent seed.
4. **Auth** — admin + user sessions, RBAC, rate limiting, password reset.
5. **Client dashboard** — portfolio, investments, deposits, withdrawals, transactions,
   notifications, settings.
6. **Admin CMS** — all modules, CRUD, reorder, media, messages, settings, audit, team.
7. **Wire end-to-end** — publish → public reflects (revalidate); finance actions sync the
   transaction ledger + notifications.
8. **Verify** — typecheck, 123 tests, production build (50 routes), seed, live smoke (all public
   routes 200), purge of scaffold residue.

## 9. Decisions made (with Henry)

1. **Client accounts: yes** — real `/login` `/register` `/dashboard` with a money lifecycle.
2. **Performance numbers** — CMS-controlled, labelled illustrative, no fabricated verified claims.
3. **Broker promo** — dropped (reference's affiliate links are not part of the product).
4. **Database** — dedicated `copipilot` role + DB on local PG16 (`:5433`).
5. **Money** — `Float` accepted for the demo build, flagged for Decimal before production money.

## 10. Explicitly out of scope (unless asked)

- Real payment processing / payment rails (deposits are recorded intents; the operator settles).
- Real broker integration or live market data.
- Email delivery (reset tokens are stored/logged; SMTP pluggable later).
- Multi-tenant / multi-site.