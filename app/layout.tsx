import type { Metadata, Viewport } from "next";
import { Rethink_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const rethink = Rethink_Sans({
  variable: "--font-rethink",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-code",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3400";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CopiPilot — Invest Smarter. Grow With CopiPilot.",
    template: "%s · CopiPilot",
  },
  description:
    "CopiPilot provides access to structured investment strategies and technology-driven financial solutions for modern investors.",
  applicationName: "CopiPilot",
  keywords: [
    "investment strategies",
    "managed strategies",
    "portfolio growth",
    "investment technology",
    "financial solutions",
    "investment platform",
  ],
  authors: [{ name: "CopiPilot" }],
  openGraph: {
    type: "website",
    siteName: "CopiPilot",
    title: "CopiPilot — Invest Smarter. Grow With CopiPilot.",
    description:
      "Access structured investment strategies and technology-driven financial solutions.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "CopiPilot — Invest Smarter. Grow With CopiPilot.",
    description:
      "Access structured investment strategies and technology-driven financial solutions.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050b16",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${rethink.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* Reveal animations start hidden; without JS they must never stay hidden. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#0b1c33",
              border: "1px solid rgba(58,141,255,0.2)",
              color: "#ffffff",
            },
          }}
        />
      </body>
    </html>
  );
}
