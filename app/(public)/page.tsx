import type { Metadata } from "next";
import {
  getFaqs,
  getHomepageSections,
  getPublishedPosts,
  getStats,
  getStrategies,
  getTestimonials,
} from "@/lib/content";
import { getSiteSettings } from "@/lib/settings";
import { Hero, type HeroContent } from "@/components/home/hero";
import { StatsStrip } from "@/components/home/stats-strip";
import { HowItWorks, type StepItem } from "@/components/home/how-it-works";
import { AboutSection } from "@/components/home/about-section";
import { StrategiesSection } from "@/components/home/strategies-section";
import { FaqSection } from "@/components/home/faq-section";
import { BlogSection } from "@/components/home/blog-section";
import { FinalCta } from "@/components/home/final-cta";
import { TestimonialsSection } from "@/components/home/testimonials";
import type { StrategyCardData } from "@/components/site/strategy-card";

export const metadata: Metadata = {
  title: "CopiPilot — Invest Smarter. Grow With CopiPilot.",
  description:
    "Access structured investment strategies and technology-driven financial solutions for modern investors.",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export default async function HomePage() {
  const [sections, stats, strategies, testimonials, faqs, posts, settings] =
    await Promise.all([
      getHomepageSections(),
      getStats(),
      getStrategies(),
      getTestimonials(),
      getFaqs(),
      getPublishedPosts({ take: 3 }),
      getSiteSettings(),
    ]);

  const byKey = Object.fromEntries(sections.map((s) => [s.key, s]));
  const hero = byKey["hero"];
  const howItWorks = byKey["how_it_works"];
  const about = byKey["about"];
  const strategiesSection = byKey["strategies"];
  const faqSection = byKey["faq"];
  const blogSection = byKey["blog"];
  const finalCta = byKey["final_cta"];

  const strategyData: StrategyCardData[] = strategies.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    shortDescription: s.shortDescription,
    minInvestment: s.minInvestment,
    maxInvestment: s.maxInvestment,
    targetReturn: s.targetReturn,
    returnPeriod: s.returnPeriod,
    durationMonths: s.durationMonths,
    riskLevel: s.riskLevel,
    strategyType: s.strategyType,
    profitFactor: s.profitFactor,
    maxDrawdown: s.maxDrawdown,
    status: s.status,
    isFeatured: s.isFeatured,
    ctaLabel: s.ctaLabel,
    ctaUrl: s.ctaUrl,
  }));

  const steps = Array.isArray(asRecord(howItWorks?.content).steps)
    ? (asRecord(howItWorks?.content).steps as StepItem[])
    : [];
  const finalContent = asRecord(finalCta?.content);

  return (
    <>
      {hero && (
        <Hero
          eyebrow={hero.eyebrow}
          title={hero.title}
          subtitle={hero.subtitle}
          content={asRecord(hero.content) as HeroContent}
        />
      )}

      <StatsStrip
        stats={stats.map((s) => ({
          id: s.id,
          label: s.label,
          value: s.value,
          suffix: s.suffix,
          note: s.note,
        }))}
      />

      {howItWorks && (
        <HowItWorks
          eyebrow={howItWorks.eyebrow}
          title={howItWorks.title}
          subtitle={howItWorks.subtitle}
          steps={steps}
        />
      )}

      {about && (
        <AboutSection
          eyebrow={about.eyebrow}
          title={about.title}
          subtitle={about.subtitle}
        />
      )}

      {strategiesSection && (
        <StrategiesSection
          eyebrow={strategiesSection.eyebrow}
          title={strategiesSection.title}
          subtitle={strategiesSection.subtitle}
          strategies={strategyData}
        />
      )}

      {testimonials.length > 0 && <TestimonialsSection items={testimonials} />}

      {faqSection && faqs.length > 0 && (
        <FaqSection
          eyebrow={faqSection.eyebrow}
          title={faqSection.title}
          subtitle={faqSection.subtitle}
          items={faqs.slice(0, 6).map((f) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
          }))}
        />
      )}

      {blogSection && posts.length > 0 && (
        <BlogSection
          eyebrow={blogSection.eyebrow}
          title={blogSection.title}
          subtitle={blogSection.subtitle}
          posts={posts.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt,
            coverImageUrl: p.coverImageUrl,
            publishedAt: p.publishedAt,
            category: p.category ? { name: p.category.name } : null,
          }))}
        />
      )}

      {finalCta && (
        <FinalCta
          title={finalCta.title}
          subtitle={finalCta.subtitle}
          ctaLabel={(finalContent.ctaLabel as string) ?? "Create your account"}
          ctaUrl={(finalContent.ctaUrl as string) ?? "/register"}
        />
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: settings.siteName,
            url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3400",
            description: settings.defaultSeoDescription,
            email: settings.contactEmail,
          }),
        }}
      />
    </>
  );
}
