import { prisma } from "./prisma";

export type SocialLinks = {
  x?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  telegram?: string;
};

export type SiteSettings = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  whatsapp: string;
  telegram: string;
  socials: SocialLinks;
  footerText: string;
  copyright: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  gaId: string;
  riskNotice: string;
  primaryColor: string;
  secondaryColor: string;
  maintenanceMode: boolean;
};

export type CalculatorSettings = {
  defaultAmount: number;
  minAmount: number;
  maxAmount: number;
  defaultMonths: number;
  availableMonths: number[];
  defaultRate: number;
  minRate: number;
  maxRate: number;
  allowCompound: boolean;
  allowSimple: boolean;
  disclaimer: string;
};

export const defaultSettings: SiteSettings = {
  siteName: "CopiPilot",
  tagline: "Investing made easy.",
  logoUrl: "/brand/copipilot-logo.svg",
  faviconUrl: "/favicon.ico",
  contactEmail: "hello@copipilot.com",
  contactPhone: "",
  address: "",
  whatsapp: "",
  telegram: "",
  socials: {},
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

export const defaultCalculatorSettings: CalculatorSettings = {
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

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...defaultSettings, ...map } as SiteSettings;
  } catch {
    return defaultSettings;
  }
}

export async function getCalculatorSettings(): Promise<CalculatorSettings> {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: "calculator" },
    });
    if (!row) return defaultCalculatorSettings;
    return { ...defaultCalculatorSettings, ...(row.value as object) } as CalculatorSettings;
  } catch {
    return defaultCalculatorSettings;
  }
}
