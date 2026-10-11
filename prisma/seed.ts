/**
 * CopiPilot seed — realistic content, idempotent.
 * Run: pnpm db:seed   (or: pnpm prisma db seed)
 *
 * Compliance note: all performance figures below are clearly-labelled
 * ILLUSTRATIVE SAMPLE DATA. Do not replace them with unverifiable claims.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/* ----------------------------------------------------------------- admin -- */

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@copipilot.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "Work@3428";
  const name = process.env.ADMIN_NAME ?? "CopiPilot Admin";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: { name, role: "SUPER_ADMIN", isActive: true },
    create: { email, name, role: "SUPER_ADMIN", passwordHash, isActive: true },
  });
  console.log(`  admin: ${email}`);
}

/* --------------------------------------------------------------- settings -- */

async function seedSettings() {
  const settings: Record<string, unknown> = {
    siteName: "CopiPilot",
    tagline: "Invest smarter. Grow with CopiPilot.",
    logoUrl: "/brand/copipilot-logo.svg",
    faviconUrl: "/favicon.ico",
    contactEmail: "hello@copipilot.com",
    contactPhone: "+1 (000) 000-0000",
    address: "",
    whatsapp: "",
    telegram: "",
    socials: {
      x: "",
      linkedin: "",
      youtube: "",
      instagram: "",
    },
    footerText:
      "CopiPilot provides access to structured investment strategies and technology-driven financial solutions.",
    copyright: `© ${new Date().getFullYear()} CopiPilot. All rights reserved.`,
    defaultSeoTitle: "CopiPilot — Invest Smarter. Grow With CopiPilot.",
    defaultSeoDescription:
      "Access structured investment strategies and technology-driven financial solutions for modern investors.",
    gaId: "",
    riskNotice:
      "Capital at risk. The value of investments can go down as well as up, and you may get back less than you invest. Projections shown are estimates only and do not guarantee future performance. Nothing on this site is financial advice.",
    primaryColor: "#D4AF37",
    secondaryColor: "#B8860B",
    maintenanceMode: false,
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value as object },
      create: { key, value: value as object },
    });
  }

  const calculator = {
    defaultAmount: 1000,
    minAmount: 100,
    maxAmount: 500000,
    defaultMonths: 12,
    availableMonths: [1, 3, 6, 12, 24, 36],
    defaultRate: 2.5,
    minRate: 0.1,
    maxRate: 20,
    allowCompound: true,
    allowSimple: true,
    disclaimer:
      "Results are estimates only and do not guarantee future performance. Investments involve risk.",
  };
  await prisma.siteSetting.upsert({
    where: { key: "calculator" },
    update: { value: calculator },
    create: { key: "calculator", value: calculator },
  });

  console.log(`  site settings: ${Object.keys(settings).length + 1}`);
}

/* ------------------------------------------------------------- navigation -- */

async function seedNavigation() {
  await prisma.navigationItem.deleteMany({});
  const header = [
    { label: "Home", url: "/", order: 1 },
    { label: "About", url: "/about", order: 2 },
    { label: "Strategies", url: "/strategies", order: 3 },
    { label: "Calculator", url: "/calculator", order: 4 },
    { label: "FAQ", url: "/faq", order: 5 },
    { label: "Blog", url: "/blog", order: 6 },
    { label: "Contact", url: "/contact", order: 7 },
  ];
  const footer = [
    { label: "About", url: "/about", order: 1 },
    { label: "Strategies", url: "/strategies", order: 2 },
    { label: "Calculator", url: "/calculator", order: 3 },
    { label: "FAQ", url: "/faq", order: 4 },
    { label: "Blog", url: "/blog", order: 5 },
    { label: "Contact", url: "/contact", order: 6 },
  ];

  for (const item of header) {
    await prisma.navigationItem.create({
      data: { ...item, location: "HEADER", isEnabled: true },
    });
  }
  for (const item of footer) {
    await prisma.navigationItem.create({
      data: { ...item, location: "FOOTER", isEnabled: true },
    });
  }
  console.log(`  navigation: ${header.length + footer.length}`);
}

/* ------------------------------------------------------- homepage sections -- */

async function seedHomepage() {
  const sections = [
    {
      key: "hero",
      eyebrow: "Structured investing",
      title: "Invest smarter. Grow with CopiPilot.",
      subtitle:
        "Access structured investment strategies and technology-driven financial solutions built for modern investors.",
      order: 1,
    },
    {
      key: "how-it-works",
      eyebrow: "How it works",
      title: "From first deposit to a managed portfolio",
      subtitle:
        "A clear, four-step path — open an account, choose a strategy, invest, and track your growth.",
      order: 2,
    },
    {
      key: "strategies",
      eyebrow: "Strategies",
      title: "Strategies matched to your appetite",
      subtitle:
        "From lower-risk income to higher-volatility growth, each strategy states its target and its risks plainly.",
      order: 3,
    },
    {
      key: "about",
      eyebrow: "About CopiPilot",
      title: "Discipline over speculation",
      subtitle:
        "We combine quantitative methods with risk-first portfolio construction — no hype, no hidden leverage.",
      order: 4,
    },
    {
      key: "testimonials",
      eyebrow: "Testimonials",
      title: "Trusted by investors in 30+ countries",
      subtitle: "Illustrative testimonials from clients describing their experience.",
      order: 5,
    },
    {
      key: "faq",
      eyebrow: "FAQ",
      title: "Questions, answered",
      subtitle: "Everything you need to know before you invest.",
      order: 6,
    },
    {
      key: "blog",
      eyebrow: "Insights",
      title: "From the CopiPilot desk",
      subtitle: "Market notes, education, and product updates.",
      order: 7,
    },
    {
      key: "cta",
      eyebrow: "Get started",
      title: "Ready to put your capital to work?",
      subtitle: "Open an account in minutes and choose a strategy that fits your goals.",
      order: 8,
    },
  ];

  for (const s of sections) {
    await prisma.homepageSection.upsert({
      where: { key: s.key },
      update: {
        eyebrow: s.eyebrow,
        title: s.title,
        subtitle: s.subtitle,
        order: s.order,
        isEnabled: true,
      },
      create: { ...s, isEnabled: true },
    });
  }
  console.log(`  homepage sections: ${sections.length}`);
}

/* ------------------------------------------------------------------ stats -- */

async function seedStats() {
  await prisma.stat.deleteMany({});
  const stats = [
    { label: "Assets under management", value: "48", suffix: "M+", note: "Illustrative sample data", order: 1 },
    { label: "Active investors", value: "12", suffix: "K+", note: "Illustrative sample data", order: 2 },
    { label: "Avg. annualised return", value: "15.4", suffix: "%", note: "Illustrative, not a guarantee", order: 3 },
    { label: "Countries served", value: "30", suffix: "+", note: "Illustrative sample data", order: 4 },
  ];
  for (const s of stats) {
    await prisma.stat.create({ data: { ...s, isEnabled: true } });
  }
  console.log(`  stats: ${stats.length}`);
}

/* ------------------------------------------------------------- strategies -- */

async function seedStrategies() {
  const strategies = [
    {
      slug: "global-momentum",
      name: "Global Momentum",
      shortDescription:
        "A quantitative momentum strategy across global equities and index futures, rebalanced monthly.",
      description:
        "Global Momentum systematically allocates to assets showing persistent price strength across equities, indices, and major futures. Positions are rebalanced monthly and risk is capped with a volatility target.\n\nTarget returns are illustrative and not guaranteed. Capital is at risk.",
      minInvestment: 500,
      maxInvestment: 50000,
      targetReturn: 18,
      returnPeriod: "annual",
      durationMonths: 12,
      riskLevel: "MEDIUM" as const,
      strategyType: "Quantitative",
      profitFactor: 1.8,
      maxDrawdown: 12.5,
      isFeatured: true,
      icon: "trending-up",
      ctaLabel: "Invest in Global Momentum",
      terms:
        "Past performance is not indicative of future results. Returns shown are illustrative targets, not promises.",
      order: 1,
    },
    {
      slug: "gold-metals",
      name: "Gold & Metals",
      shortDescription:
        "A defensive allocation to precious and industrial metals, designed to hedge inflation and equity drawdowns.",
      description:
        "Gold & Metals holds a blend of precious and industrial metals, tactically adjusted for macro conditions. It is intended as a diversifier against inflation and equity-market stress.\n\nTarget returns are illustrative and not guaranteed. Capital is at risk.",
      minInvestment: 1000,
      maxInvestment: 100000,
      targetReturn: 14,
      returnPeriod: "annual",
      durationMonths: 12,
      riskLevel: "MEDIUM" as const,
      strategyType: "Commodities",
      profitFactor: 1.5,
      maxDrawdown: 10,
      isFeatured: true,
      icon: "gem",
      ctaLabel: "Invest in Gold & Metals",
      terms: "Metals can be volatile and may fall as well as rise.",
      order: 2,
    },
    {
      slug: "income-yield",
      name: "Income & Yield",
      shortDescription:
        "A lower-risk income strategy focused on short-duration credit and yield-bearing instruments.",
      description:
        "Income & Yield targets steady, lower-volatility income from short-duration credit and yield-bearing instruments. It prioritises capital preservation over headline growth.\n\nTarget returns are illustrative and not guaranteed.",
      minInvestment: 250,
      maxInvestment: 25000,
      targetReturn: 9,
      returnPeriod: "annual",
      durationMonths: 6,
      riskLevel: "LOW" as const,
      strategyType: "Fixed income",
      profitFactor: 1.2,
      maxDrawdown: 4,
      isFeatured: false,
      icon: "piggy-bank",
      ctaLabel: "Invest in Income & Yield",
      terms: "Lower risk does not mean no risk. Capital is still at risk.",
      order: 3,
    },
    {
      slug: "alpha-growth",
      name: "Alpha Growth",
      shortDescription:
        "A higher-volatility, multi-asset growth strategy for investors with a long horizon and high risk tolerance.",
      description:
        "Alpha Growth is an aggressive, multi-asset strategy that accepts greater short-term volatility in pursuit of long-term growth. Suitable only for investors who can tolerate significant drawdowns.\n\nTarget returns are illustrative and not guaranteed. Capital is at risk.",
      minInvestment: 5000,
      maxInvestment: null,
      targetReturn: 26,
      returnPeriod: "annual",
      durationMonths: 24,
      riskLevel: "HIGH" as const,
      strategyType: "Multi-asset",
      profitFactor: 2.1,
      maxDrawdown: 25,
      isFeatured: false,
      icon: "rocket",
      ctaLabel: "Invest in Alpha Growth",
      terms: "High risk. Substantial losses are possible.",
      order: 4,
    },
  ];

  for (const s of strategies) {
    await prisma.strategy.upsert({
      where: { slug: s.slug },
      update: { ...s, status: "ACTIVE" },
      create: { ...s, status: "ACTIVE" },
    });
  }
  console.log(`  strategies: ${strategies.length}`);
}

/* ----------------------------------------------------------- testimonials -- */

async function seedTestimonials() {
  await prisma.testimonial.deleteMany({});
  const items = [
    {
      name: "Amara O.",
      role: "Private investor",
      company: "Lagos",
      quote:
        "The reporting is clear and the risk disclosures are upfront. I always know exactly where my capital sits.",
      order: 1,
    },
    {
      name: "Daniel R.",
      role: "Portfolio manager",
      company: "London",
      quote:
        "CopiPilot's strategy pages state their targets and their drawdowns plainly. That honesty is rare.",
      order: 2,
    },
    {
      name: "Sofia M.",
      role: "Business owner",
      company: "Madrid",
      quote:
        "Onboarding took minutes and the dashboard gives me the full picture without any jargon.",
      order: 3,
    },
  ];
  for (const t of items) {
    await prisma.testimonial.create({ data: { ...t, isEnabled: true } });
  }
  console.log(`  testimonials: ${items.length}`);
}

/* -------------------------------------------------------------------- faqs -- */

async function seedFaqs() {
  await prisma.faq.deleteMany({});
  const faqs = [
    {
      question: "How do I open an account?",
      answer:
        "Register with your email, confirm your details, and you can request your first deposit. Our team reviews every deposit before funds are credited.",
      category: "Getting started",
      order: 1,
    },
    {
      question: "How are returns calculated?",
      answer:
        "Any figures shown are illustrative projections based on a target rate, not promises. Actual results depend on market conditions and can be negative.",
      category: "Returns",
      order: 2,
    },
    {
      question: "What is the minimum investment?",
      answer:
        "It depends on the strategy. Income & Yield starts at $250, Global Momentum at $500, and Alpha Growth at $5,000. Each strategy page states its minimum.",
      category: "Investing",
      order: 3,
    },
    {
      question: "How do withdrawals work?",
      answer:
        "Request a withdrawal from your dashboard. Requests are reviewed by our team before payout, and you can only withdraw your available balance.",
      category: "Withdrawals",
      order: 4,
    },
    {
      question: "Is my capital at risk?",
      answer:
        "Yes. All investing involves risk. The value of investments can go down as well as up, and you may get back less than you invested.",
      category: "Risk",
      order: 5,
    },
    {
      question: "Do you provide financial advice?",
      answer:
        "No. CopiPilot provides tools and structured strategies. Nothing on the platform is personal financial advice.",
      category: "General",
      order: 6,
    },
  ];
  for (const f of faqs) {
    await prisma.faq.create({ data: { ...f, isEnabled: true } });
  }
  console.log(`  faqs: ${faqs.length}`);
}

/* -------------------------------------------------------------------- blog -- */

async function seedBlog() {
  const categories = [
    { name: "Market Insights", slug: "market-insights", description: "Notes on markets and macro.", order: 1 },
    { name: "Education", slug: "education", description: "Learn the fundamentals.", order: 2 },
    { name: "Company", slug: "company", description: "Product and company updates.", order: 3 },
  ];
  const categoryIds: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.blogCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, order: c.order },
      create: c,
    });
    categoryIds[c.slug] = row.id;
  }

  const posts = [
    {
      title: "How to think about risk before you invest",
      slug: "how-to-think-about-risk",
      excerpt:
        "Return is the reward for bearing risk. Before chasing a number, understand the drawdown you can actually live with.",
      content:
        "## Start with the downside\n\nMost investors fixate on the return. The professionals fixate on the drawdown — the worst peak-to-trough loss they can endure without panicking.\n\n## Position sizing\n\nNo single position should be able to end your portfolio. Risk is managed at the level of the whole book, not the individual trade.\n\n## Time horizon\n\nA strategy that is sensible over ten years can be ruinous over ten months. Match the strategy to the horizon.\n\n> This article is educational and is not financial advice.",
      categorySlug: "education",
      tags: ["risk", "education", "portfolio"],
      isFeatured: true,
      status: "PUBLISHED" as const,
    },
    {
      title: "Diversification is the only free lunch",
      slug: "diversification-free-lunch",
      excerpt:
        "Combining assets that do not move together can reduce risk without giving up return. Here is why it works.",
      content:
        "## Correlation is the key\n\nDiversification works because imperfectly correlated assets smooth the ride. Two volatile assets that zig when the other zags can combine into something steadier.\n\n## What it does not do\n\nIt does not remove risk, and in a crisis correlations can converge. It reduces the risk you are not paid to take.\n\n> This article is educational and is not financial advice.",
      categorySlug: "education",
      tags: ["diversification", "portfolio"],
      isFeatured: false,
      status: "PUBLISHED" as const,
    },
    {
      title: "Introducing CopiPilot",
      slug: "introducing-copipilot",
      excerpt:
        "A new home for structured investment strategies and technology-driven financial solutions.",
      content:
        "## Why we built CopiPilot\n\nInvesting should be transparent. We built CopiPilot to give investors clear strategies, honest risk disclosures, and a dashboard that shows exactly where their capital sits.\n\n## What is next\n\nWe are expanding our strategy range and improving the reporting tools. Follow the blog for updates.\n\n> This article is informational and is not financial advice.",
      categorySlug: "company",
      tags: ["announcement"],
      isFeatured: false,
      status: "PUBLISHED" as const,
    },
  ];

  for (const p of posts) {
    const { categorySlug, tags, ...rest } = p;
    const post = await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {
        ...rest,
        categoryId: categoryIds[categorySlug] ?? null,
        publishedAt: new Date(),
      },
      create: {
        ...rest,
        categoryId: categoryIds[categorySlug] ?? null,
        publishedAt: new Date(),
      },
    });

    await prisma.blogPostTag.deleteMany({ where: { postId: post.id } });
    for (const name of tags) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const tag = await prisma.blogTag.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
      });
      await prisma.blogPostTag.create({ data: { postId: post.id, tagId: tag.id } });
    }
  }
  console.log(`  blog: ${categories.length} categories, ${posts.length} posts`);
}

/* ------------------------------------------------------------------- demo -- */

async function seedDemoClient() {
  const email = (process.env.DEMO_USER_EMAIL ?? "client@copipilot.com").toLowerCase();
  const password = process.env.DEMO_USER_PASSWORD ?? "Work@3428";
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { fullName: "Demo Client", status: "ACTIVE" },
    create: {
      email,
      fullName: "Demo Client",
      passwordHash,
      country: "United States",
      status: "ACTIVE",
    },
  });

  // Reset the demo client's financial history so re-seeding is deterministic.
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.investment.deleteMany({ where: { userId: user.id } });
  await prisma.deposit.deleteMany({ where: { userId: user.id } });
  await prisma.withdrawal.deleteMany({ where: { userId: user.id } });
  await prisma.notification.deleteMany({ where: { userId: user.id } });

  const deposit = await prisma.deposit.create({
    data: {
      userId: user.id,
      amount: 5000,
      method: "BANK_TRANSFER",
      reference: "SEED-DEP-001",
      status: "COMPLETED",
      reviewedAt: new Date(),
    },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: "DEPOSIT",
      amount: 5000,
      status: "COMPLETED",
      description: "Initial deposit",
      relatedId: deposit.id,
    },
  });

  const strategy = await prisma.strategy.findUnique({ where: { slug: "global-momentum" } });
  if (strategy) {
    const investment = await prisma.investment.create({
      data: {
        userId: user.id,
        strategyId: strategy.id,
        amount: 2000,
        status: "ACTIVE",
        durationMonths: 12,
        startedAt: new Date(),
        profitLoss: 120,
        referenceId: "INV-SEED-001",
      },
    });
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "INVESTMENT",
        amount: 2000,
        status: "COMPLETED",
        description: `Investment in ${strategy.name}`,
        relatedId: investment.id,
      },
    });
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "PROFIT",
        amount: 120,
        status: "COMPLETED",
        description: `${strategy.name} profit accrual`,
        relatedId: investment.id,
      },
    });
  }

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "SYSTEM",
      title: "Welcome to CopiPilot",
      body: "Your account is ready. Explore our strategies and make your first investment.",
      link: "/strategies",
    },
  });

  console.log(`  demo client: ${email}`);
}

/* ------------------------------------------------------------------ pages -- */

async function seedPages() {
  const pages = [
    {
      slug: "terms",
      title: "Terms of Service",
      content:
        "## Terms of Service\n\nThis is placeholder content. Replace it with your reviewed terms before launch.",
      status: "PUBLISHED" as const,
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      content:
        "## Privacy Policy\n\nThis is placeholder content. Replace it with your reviewed privacy policy before launch.",
      status: "PUBLISHED" as const,
    },
  ];
  for (const p of pages) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: { title: p.title, content: p.content, status: p.status, publishedAt: new Date() },
      create: { ...p, publishedAt: new Date() },
    });
  }
  console.log(`  pages: ${pages.length}`);
}

/* ------------------------------------------------------------------- main -- */

async function main() {
  console.log("Seeding CopiPilot…");
  await seedAdmin();
  await seedSettings();
  await seedNavigation();
  await seedHomepage();
  await seedStats();
  await seedStrategies();
  await seedTestimonials();
  await seedFaqs();
  await seedBlog();
  await seedPages();
  await seedDemoClient();
  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
