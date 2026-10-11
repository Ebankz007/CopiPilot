import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { getNavigation } from "@/lib/content";
import { getSiteSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, header, footer, user] = await Promise.all([
    getSiteSettings(),
    getNavigation("HEADER"),
    getNavigation("FOOTER"),
    getCurrentUser(),
  ]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to content
      </a>
      <Navbar items={header} siteName={settings.siteName} isAuthed={Boolean(user)} />
      <main id="main" className="min-h-screen">
        {children}
      </main>
      <Footer settings={settings} items={footer} />
    </>
  );
}
