# Reference Website Audit — superflycapital.com

> Conducted 2026-10-11 by Kairos. Source: live render of the public site. This is an audit of
> *structure and experience* — not a licence to copy code, copy, images, or branding.

## 1. What the reference actually is

- **Product:** a "private access" managed-investment funnel. Investors are told their capital is
  deployed into an automated trading system generating returns from market performance.
- **Built on:** WordPress (`/wp-content/` assets, FAQ accordion anchors, blog).
- **Reality check:** there is **no account system, no login, no dashboard** on the public site.
  The entire funnel is **lead generation**: "Get Private Access" buttons, a request form, and
  **external broker affiliate links** (Vantage, PuPrime, Ultima, EC Markets). "Launching Soon"
  strategies ship with blank performance fields. Legal links (Privacy, Terms) are `#` placeholders.

## 2. What the site is (section order)

1. **Header** — logo + "Get Private Access" CTA.
2. **Hero** — "Grow Your Wealth With Superfly Capital"; copy about automated execution; CTA.
3. **Broker strip** — four affiliate broker logos (external links).
4. **How It Works** — 3 steps (Create access request → Connect account → System activation).
5. **About** — mission copy (business consulting + investment).
6. **Trading Systems** — 3 strategies:
   - **Superfly V1** (live): min deposit $100, yearly performance 74.26%, max drawdown 6%,
     risk Medium, profit factor 3.55.
   - **Superfly 2.0** / **3.0**: "Launching Soon" — min $1,000 / $10,000, all figures blank.
7. **Investment Calculator** — amount slider ($50–$500k), duration (1–36 months), monthly return
   rate (default 20%, flat), compound toggle (reinvest monthly profits), summary + projected
   growth chart; disclaimer "* Results are estimates only and do not guarantee future performance."
8. **FAQ** — accordion; includes "since inception, we have not recorded a losing month".
9. **Blog** — 3 posts (crypto vs gold, investing in gold online, passive income).
10. **Final CTA** — "Activate Your Superfly Capital Access in Minutes".
11. **Footer** — logo, quick links, support links (all `#`), socials (Instagram/Facebook/Youtube/Twitter).

## 3. Design system (observed)

- **Theme:** dark, **"Blue Premium"** (the site's own label) — navy/blue accent on dark.
- Typography: sans body + display headings; cards with rounded corners; glow accents.
- Interactions: accordion FAQ, calculator with live summary + growth chart, hover states,
  sticky header, mobile-responsive layout.

## 4. Compliance flags (important)

The reference makes **hard financial-performance claims** with zero substantiation on the page:
- "Yearly Performance: 74.26%" and "Profit Factor: 3.55" (V1).
- "Since inception, we have not recorded a losing month."
- A calculator defaulting to **20% monthly returns**.
- **Broker affiliate links** with no disclosure visible.

For a live CopiPilot site these are the highest-risk elements: they must be **CMS-controlled**,
**disclaimed**, and never presented as guaranteed. See `CONCEPT.md` §7 and `PLAN.md` §7.

## 5. What "clone and rebrand" means here

Clone the **marketing experience** (structure, rhythm, sections, interactions, responsiveness)
with **original code, original copy, an original logo, and a blue/navy palette**. Do **not**
copy the reference's copy, images, logo, or affiliate links. The **admin CMS, database, client
dashboard, and auth are net-new** — the reference has none.