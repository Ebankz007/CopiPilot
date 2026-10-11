import { z } from "zod";

export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: "Enter a valid email address" }))
  .pipe(z.string().max(200));

export const passwordField = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(200, { message: "Password is too long" });

export const slugField = z
  .string()
  .trim()
  .min(1)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Use lowercase letters, numbers, and hyphens only",
  });

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

/* ----------------------------------------------------------------- public */

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, { message: "Password is required" }),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, { message: "Please enter your name" }).max(120),
  email: emailField,
  password: passwordField,
  phone: optionalText(40),
  country: optionalText(80),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, { message: "Please enter your name" }).max(120),
  email: emailField,
  phone: optionalText(40),
  subject: optionalText(160),
  message: z
    .string()
    .trim()
    .min(10, { message: "Please tell us a little more" })
    .max(4000),
  // honeypot — accept any value so validation passes and the route silently
  // discards the submission (a 400 would tell the bot it was detected).
  company: z.string().max(200).optional().or(z.literal("")),
});

export const forgotPasswordSchema = z.object({ email: emailField });

export const resetPasswordSchema = z.object({
  token: z.string().min(10).max(400),
  password: passwordField,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: passwordField,
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: optionalText(40),
  country: optionalText(80),
});

/* ---------------------------------------------------------- client finance */

export const depositRequestSchema = z.object({
  amount: z.coerce.number().positive({ message: "Enter an amount" }).max(100_000_000),
  method: z.enum(["BANK_TRANSFER", "CARD", "CRYPTO", "WALLET", "OTHER"]).default("BANK_TRANSFER"),
  reference: optionalText(160),
});

export const withdrawalRequestSchema = z.object({
  amount: z.coerce.number().positive({ message: "Enter an amount" }).max(100_000_000),
  method: z.enum(["BANK_TRANSFER", "CARD", "CRYPTO", "WALLET", "OTHER"]).default("BANK_TRANSFER"),
  destination: z.string().trim().min(3, { message: "Enter payout details" }).max(300),
});

export const investmentRequestSchema = z.object({
  strategyId: z.string().min(1, { message: "Choose a strategy" }),
  amount: z.coerce.number().positive({ message: "Enter an amount" }).max(100_000_000),
});

/* ------------------------------------------------------------------ admin */

export const adminLoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, { message: "Password is required" }),
});

export const adminUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailField,
  role: z.enum(["SUPER_ADMIN", "CONTENT_ADMIN", "SUPPORT_ADMIN", "FINANCE_ADMIN"]),
  isActive: z.coerce.boolean().default(true),
});

export const strategySchema = z.object({
  name: z.string().trim().min(2).max(140),
  slug: slugField,
  shortDescription: z.string().trim().min(3).max(500),
  description: z.string().trim().min(3).max(20_000),
  minInvestment: z.coerce.number().min(0),
  maxInvestment: z.coerce.number().min(0).optional().nullable(),
  targetReturn: z.coerce.number().min(0).max(10_000).optional().nullable(),
  returnPeriod: optionalText(40),
  durationMonths: z.coerce.number().int().min(0).max(600).optional().nullable(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  strategyType: z.string().trim().min(1).max(80).default("Automated"),
  profitFactor: z.coerce.number().min(0).max(1000).optional().nullable(),
  maxDrawdown: z.coerce.number().min(0).max(1000).optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "COMING_SOON"]).default("ACTIVE"),
  isFeatured: z.coerce.boolean().default(false),
  icon: optionalText(60),
  imageUrl: optionalText(300),
  ctaLabel: z.string().trim().max(60).default("Get started"),
  ctaUrl: optionalText(300),
  terms: optionalText(4000),
  order: z.coerce.number().int().min(0).default(0),
});

export const calculatorSettingsSchema = z.object({
  defaultAmount: z.coerce.number().min(0),
  minAmount: z.coerce.number().min(0),
  maxAmount: z.coerce.number().min(0),
  defaultMonths: z.coerce.number().int().min(1).max(600),
  availableMonths: z.array(z.coerce.number().int().min(1).max(600)).min(1),
  defaultRate: z.coerce.number().min(0).max(1000),
  minRate: z.coerce.number().min(0).max(1000),
  maxRate: z.coerce.number().min(0).max(1000),
  allowCompound: z.coerce.boolean().default(true),
  allowSimple: z.coerce.boolean().default(true),
  disclaimer: z.string().trim().max(600),
});

export const blogPostSchema = z.object({
  title: z.string().trim().min(2).max(220),
  slug: slugField,
  excerpt: z.string().trim().min(3).max(600),
  content: z.string().trim().min(3).max(200_000),
  categoryId: optionalText(60),
  authorName: z.string().trim().min(1).max(120).default("CopiPilot Desk"),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).default("DRAFT"),
  isFeatured: z.coerce.boolean().default(false),
  coverImageUrl: optionalText(300),
  seoTitle: optionalText(200),
  seoDescription: optionalText(400),
  publishedAt: optionalText(40),
  tags: z.array(z.string().trim().min(1).max(60)).default([]),
});

export const blogCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slugField,
  description: optionalText(400),
  order: z.coerce.number().int().min(0).default(0),
});

export const blogTagSchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export const faqSchema = z.object({
  question: z.string().trim().min(3).max(300),
  answer: z.string().trim().min(3).max(5000),
  category: optionalText(80),
  order: z.coerce.number().int().min(0).default(0),
  isEnabled: z.coerce.boolean().default(true),
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: optionalText(120),
  company: optionalText(120),
  quote: z.string().trim().min(10).max(2000),
  order: z.coerce.number().int().min(0).default(0),
  isEnabled: z.coerce.boolean().default(true),
});

export const statSchema = z.object({
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(40),
  suffix: optionalText(12),
  note: optionalText(200),
  order: z.coerce.number().int().min(0).default(0),
  isEnabled: z.coerce.boolean().default(true),
});

export const navItemSchema = z.object({
  label: z.string().trim().min(1).max(80),
  url: z.string().trim().min(1).max(300),
  location: z.enum(["HEADER", "FOOTER"]).default("HEADER"),
  order: z.coerce.number().int().min(0).default(0),
  isEnabled: z.coerce.boolean().default(true),
  isExternal: z.coerce.boolean().default(false),
});

export const pageSchema = z.object({
  slug: slugField,
  title: z.string().trim().min(1).max(200),
  content: z.string().max(100_000),
  metaTitle: optionalText(200),
  metaDescription: optionalText(400),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).default("DRAFT"),
});

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(200),
  logoUrl: optionalText(300),
  faviconUrl: optionalText(300),
  contactEmail: z.string().trim().max(200),
  contactPhone: optionalText(60),
  address: optionalText(300),
  whatsapp: optionalText(300),
  telegram: optionalText(300),
  footerText: z.string().trim().max(1000),
  copyright: z.string().trim().max(300),
  defaultSeoTitle: z.string().trim().max(200),
  defaultSeoDescription: z.string().trim().max(400),
  gaId: optionalText(40),
  riskNotice: z.string().trim().max(2000),
  primaryColor: z.string().trim().max(20).default("#D4AF37"),
  secondaryColor: z.string().trim().max(20).default("#B8860B"),
  maintenanceMode: z.coerce.boolean().default(false),
  socials: z
    .object({
      x: optionalText(300),
      facebook: optionalText(300),
      instagram: optionalText(300),
      linkedin: optionalText(300),
      youtube: optionalText(300),
      telegram: optionalText(300),
    })
    .default({}),
});

export const homepageSectionSchema = z.object({
  key: z.string().trim().min(1).max(60),
  eyebrow: optionalText(200),
  title: z.string().trim().min(1).max(300),
  subtitle: optionalText(2000),
  content: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
  isEnabled: z.coerce.boolean().default(true),
});

/* ------------------------------------------------------------------ types */

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type StrategyInput = z.infer<typeof strategySchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type CalculatorSettingsInput = z.infer<typeof calculatorSettingsSchema>;
