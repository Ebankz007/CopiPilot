/**
 * CopiPilot seed — realistic content, idempotent.
 * Run: pnpm db:seed   (or: pnpm prisma db seed)
 *
 * Compliance note: all performance figures below are clearly-labelled
 * ILLUSTRATIVE SAMPLE DATA. Do not replace them with unverifiable claims.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Prisma } from "../lib/generated/prisma/client";
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
    tagline: "Investing made easy.",
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
      "Your capital is deployed into a fully automated system that executes strategies and generates returns based on market performance.",
    copyright: `© ${new Date().getFullYear()} CopiPilot. All rights reserved.`,
    defaultSeoTitle: "CopiPilot — Grow Your Wealth With CopiPilot.",
    defaultSeoDescription:
      "Your capital is deployed into a fully automated system that executes strategies and generates returns based on market performance.",
    gaId: "",
    riskNotice:
      "Capital at risk. The value of investments can go down as well as up, and you may get back less than you invest. Projections shown are estimates only and do not guarantee future performance. Nothing on this site is financial advice.",
    primaryColor: "#3a8dff",
    secondaryColor: "#015bc4",
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
  const sections: {
    key: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    order: number;
    content?: Prisma.InputJsonValue;
  }[] = [
    {
      key: "hero",
      eyebrow: "Investing Made Easy",
      title: "Grow Your Wealth With CopiPilot",
      subtitle:
        "Your capital is deployed into a fully automated system that executes strategies and generates returns based on market performance.",
      order: 1,
    },
    {
      key: "how_it_works",
      eyebrow: "How It Works",
      title: "A simple step-by-step process",
      subtitle:
        "A simple step-by-step process to activate your CopiPilot access and connect your account.",
      content: {
        steps: [
          {
            title: "Create Your Access Request",
            body: "Start by submitting your basic details to begin the onboarding process. You'll gain access to the CopiPilot system setup.",
          },
          {
            title: "Connect Your Account",
            body: "Log in or create a new account and securely connect it to your CopiPilot access profile. This step ensures your account is ready for system integration.",
          },
          {
            title: "System Activation & Tracking",
            body: "Your account is linked to the automated strategy system, and performance activity is reflected through your dashboard.",
          },
        ],
      },
      order: 2,
    },
    {
      key: "about",
      eyebrow: "About us",
      title: "Building Stronger Businesses Through Strategic Guidance",
      subtitle:
        "We believe every successful business and investment journey begins with a clear vision and a well-defined strategy. Our mission is to support entrepreneurs, businesses, traders, and investors with practical solutions that drive growth, improve performance, and create long-term value — backed by expertise in business consulting, investment research, market analysis, project planning, and strategic development.",
      order: 3,
    },
    {
      key: "strategies",
      eyebrow: "Trading Systems",
      title: "Smart Investing for Smarter Growth",
      subtitle: "Transparent, value-driven strategies for modern investors.",
      order: 4,
    },
    {
      key: "calculator",
      eyebrow: "Investment Calculator",
      title: "Calculate Your Potential Returns",
      subtitle:
        "See how your investment can grow with our advanced compound interest calculator.",
      order: 5,
    },
    {
      key: "faq",
      eyebrow: "FAQ",
      title: "We're here to help",
      subtitle:
        "Got questions? We've got answers. Explore common questions about our investment process, performance approach, and support.",
      order: 6,
    },
    {
      key: "blog",
      eyebrow: "Blog",
      title: "Latest Blog & News",
      subtitle:
        "Expert guidance for business growth, investment success, and strategic planning. Backed by integrity and built for results.",
      order: 7,
    },
    {
      key: "final_cta",
      eyebrow: "Get started",
      title: "Activate Your CopiPilot Access in Minutes",
      subtitle:
        "Your capital is deployed into a fully automated system that executes strategies and generates returns based on market performance.",
      order: 8,
    },
  ];

  for (const s of sections) {
    const content = s.content ?? {};
    await prisma.homepageSection.upsert({
      where: { key: s.key },
      update: {
        eyebrow: s.eyebrow,
        title: s.title,
        subtitle: s.subtitle,
        content,
        order: s.order,
        isEnabled: true,
      },
      create: { ...s, content, isEnabled: true },
    });
  }
  // Retire legacy section keys (e.g. the old "how-it-works" / "cta" / "testimonials").
  await prisma.homepageSection.updateMany({
    where: { key: { notIn: sections.map((s) => s.key) } },
    data: { isEnabled: false },
  });
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
      slug: "copipilot-v1",
      name: "CopiPilot V1",
      shortDescription:
        "Perfect for individuals and small investors getting started with forex trading.",
      description:
        "CopiPilot V1 is our flagship automated forex strategy, built for investors who want a straightforward entry point. It trades major currency pairs with strict risk controls and a volatility-aware position-sizing model.\n\nPerformance figures are illustrative sample data and are not a promise of future results. Capital is at risk.",
      minInvestment: 100,
      maxInvestment: null,
      targetReturn: 18,
      returnPeriod: "annual",
      durationMonths: 12,
      riskLevel: "MEDIUM" as const,
      strategyType: "Forex",
      profitFactor: 1.8,
      maxDrawdown: 12.5,
      isFeatured: true,
      icon: "trending-up",
      ctaLabel: "Join Now",
      terms:
        "Past performance is not indicative of future results. Returns shown are illustrative targets, not promises.",
      status: "ACTIVE" as const,
      order: 1,
    },
    {
      slug: "copipilot-2",
      name: "CopiPilot 2.0",
      shortDescription:
        "Ideal for investors ready to expand their portfolio with commodities.",
      description:
        "CopiPilot 2.0 extends the system into commodities, blending precious and industrial metals with managed exposure. Launching soon — join the waitlist for early access.",
      minInvestment: 1000,
      maxInvestment: null,
      targetReturn: null,
      returnPeriod: null,
      durationMonths: null,
      riskLevel: "MEDIUM" as const,
      strategyType: "Commodities",
      profitFactor: null,
      maxDrawdown: null,
      isFeatured: false,
      icon: "gem",
      ctaLabel: "Join Now",
      terms: "Launching soon. Details to be confirmed.",
      status: "COMING_SOON" as const,
      order: 2,
    },
    {
      slug: "copipilot-3",
      name: "CopiPilot 3.0",
      shortDescription:
        "Ideal for investors ready to expand their portfolio with commodities.",
      description:
        "CopiPilot 3.0 is our highest-capacity multi-asset program, designed for larger allocations across global markets. Launching soon — join the waitlist for early access.",
      minInvestment: 10000,
      maxInvestment: null,
      targetReturn: null,
      returnPeriod: null,
      durationMonths: null,
      riskLevel: "HIGH" as const,
      strategyType: "Multi-asset",
      profitFactor: null,
      maxDrawdown: null,
      isFeatured: false,
      icon: "rocket",
      ctaLabel: "Join Now",
      terms: "Launching soon. Details to be confirmed.",
      status: "COMING_SOON" as const,
      order: 3,
    },
  ];

  for (const s of strategies) {
    await prisma.strategy.upsert({
      where: { slug: s.slug },
      update: { ...s },
      create: { ...s },
    });
  }
  // Retire legacy strategies so they no longer surface anywhere on the site.
  await prisma.strategy.updateMany({
    where: { slug: { notIn: strategies.map((s) => s.slug) } },
    data: { status: "INACTIVE" },
  });
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
      question: "How does CopiPilot work?",
      answer:
        "CopiPilot provides investors with access to professionally managed trading strategies designed to identify opportunities across global financial markets while maintaining a strong focus on risk management.",
      category: "General",
      order: 1,
    },
    {
      question: "What is the minimum amount required to get started?",
      answer:
        "The minimum investment amount varies depending on the investment program selected. Contact our team to discuss the most suitable option based on your financial goals.",
      category: "Investing",
      order: 2,
    },
    {
      question: "How do you manage risk?",
      answer:
        "Capital preservation is a key priority. Our strategies incorporate strict risk management principles, including controlled exposure, disciplined position sizing, and ongoing market analysis.",
      category: "Risk",
      order: 3,
    },
    {
      question: "Can I access my funds when needed?",
      answer:
        "Yes. Investors maintain access to their funds, subject to the terms and conditions of the selected investment program and applicable processing times.",
      category: "Withdrawals",
      order: 4,
    },
    {
      question: "Why do investors choose CopiPilot?",
      answer:
        "Investors choose CopiPilot for its disciplined risk management, transparent approach, and consistent process. All investing involves risk and future results cannot be guaranteed.",
      category: "General",
      order: 5,
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

  const strategy = await prisma.strategy.findUnique({ where: { slug: "copipilot-v1" } });
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
