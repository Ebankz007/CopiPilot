# CopiPilot — Concept

> Working document. Grows only from Henry's frame and verified fact.
> Last updated: 2026-10-11.

## 1. One-line frame

**CopiPilot is an investment platform — a premium marketing site, a client dashboard for
deposits/investments/withdrawals, and a full admin CMS — built to the structure and user
experience of the reference site `superflycapital.com`, rebranded and restyled blue/navy, with
a net-new database, secure auth, and an operational backend behind it.**

## 2. What it is

- **Public face:** a modern fintech marketing site — Home, About, Strategies (+ detail),
  Investment Calculator, Blog (+ detail), FAQ, Contact, Login/Register, and legal pages.
- **Client area:** a real dashboard where a registered client can deposit, request investments
  against CMS-managed strategies, withdraw, and watch their portfolio value move — every action
  validated, rate-limited, and recorded in an immutable transaction ledger.
- **Engine room:** a full admin CMS on PostgreSQL so a non-developer can edit every meaningful
  word, strategy, price, blog post, testimonial, FAQ, menu item, page, and setting — with
  role-based access control and a complete audit log.
- **Voice:** professional, precise, no hype, no guaranteed-return claims.

## 3. Who it serves

- **Investors** wanting a managed, strategy-based investment product with a visible portfolio.
- **The operator (CopiPilot)** who needs to run the whole site — content, clients, and finance —
  from an admin console without touching code.

## 4. The wedge

The reference is a **lead-generation site**: "Private Access" funnels, external broker links, no
accounts, no backend, no real client journey. CopiPilot's wedge is that it is the **operable
version**: real accounts, real deposits/withdrawals lifecycle, real content pipeline, real audit.
Same polish, actual substance.

## 5. Displacement

Displaces the "Lovable one-pager" / WordPress lead-gen class of fintech landing site: pretty but
unmaintainable and un-operable. CopiPilot keeps the polish and adds the operational spine.

## 6. Business model

- Client **capital deployed into strategies** (CMS-managed strategy catalog, risk levels,
  minimums).
- **Deposit / withdrawal** lifecycle managed in-app (payment rails are operator-side; the
  platform records intent and approval).
- Future: referral/affiliate programs, tiered strategies (the reference's V1/V2/V3 ladder).

## 7. Risks & compliance posture

- **Regulated activity.** Taking deposits and advertising returns is regulated in most
  jurisdictions. This is flagged once, clearly: the operator owns the legal call.
- **Performance claims.** The reference advertises "74.26% yearly performance" and "no losing
  month." CopiPilot ships **no fabricated verified claims** — strategy performance fields are
  CMS-controlled and must be labelled as illustrative/past performance with a risk note, never
  guaranteed.
- **Calculator.** Returns are estimates only; the calculator carries an explicit disclaimer and
  `* Results are estimates only` language.
- **Legal pages** ship with reviewable baseline copy (flagged for counsel), not fake sign-off.
- **Money is `Float` in the schema** (flagged): production should move to `Decimal`/integer
  minor units before real money moves.

## 8. Kill criteria

- If the performance-claims question cannot be answered honestly (no real verified data and no
  willingness to label it sample), ship the sections without fabricated numbers.
- If real deposits are taken before legal review and Decimal money, stop and fix both first.

## 9. References

- `docs/AUDIT.md` — the reference site audit.
- `docs/PLAN.md` — stack, routes, data model, security, build order.
- `docs/DEPLOY.md` — aaPanel production guide.
- `docs/REPORT.md` — final deliverable report (written at completion).