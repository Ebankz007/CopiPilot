import Link from "next/link";
import { Logo } from "./logo";
import type { SiteSettings } from "@/lib/settings";

type NavItem = { id: string; label: string; url: string; isExternal: boolean };

/**
 * lucide-react no longer ships brand glyphs, so we inline the paths we need.
 * viewBox is 24x24 and the marks are filled with `currentColor`.
 */
const SOCIAL_PATHS: Record<string, string> = {
  x: "M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.9-6.4L6.3 22H3.2l7.3-8.3L1.7 2h6.4l4.4 5.8L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z",
  facebook:
    "M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.5-1.5H17V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.2H7.8V14h2.7v8h3Z",
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2A6.6 6.6 0 1 0 12 18.6 6.6 6.6 0 0 0 12 5.4Zm0 10.9A4.3 4.3 0 1 1 12 7.7a4.3 4.3 0 0 1 0 8.6Zm6.8-11.2a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
  linkedin:
    "M6.9 21.5H3.6V9h3.3v12.5ZM5.25 7.5A1.9 1.9 0 1 1 5.25 3.7a1.9 1.9 0 0 1 0 3.8ZM21 21.5h-3.3v-6.1c0-1.5-.5-2.5-1.8-2.5-1 0-1.6.7-1.9 1.3-.1.3-.1.6-.1 1v6.3H10.6s.05-10.2 0-11.3h3.3v1.6c.4-.7 1.2-1.7 3-1.7 2.2 0 3.9 1.4 3.9 4.5v6.9Z",
  youtube:
    "M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8 1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15.2V8.8l5.2 3.2-5.2 3.2Z",
  telegram:
    "M21.9 4.4 18.6 20c-.2 1-.9 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8L17.6 6c.4-.3-.1-.5-.6-.2L6.4 12.4l-4.6-1.4c-1-.3-1-1 .2-1.5l18-6.9c.8-.3 1.6.2 1.3 1.8Z",
};

function SocialIcon({ name }: { name: string }) {
  const path = SOCIAL_PATHS[name];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
      <path d={path} />
    </svg>
  );
}

export function Footer({
  settings,
  items,
}: {
  settings: SiteSettings;
  items: NavItem[];
}) {
  const socials = Object.entries(settings.socials ?? {}).filter(
    ([, url]) => url,
  ) as [string, string][];

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo siteName={settings.siteName} />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {settings.footerText}
            </p>
            <div className="mt-5 space-y-1 text-sm text-muted">
              {settings.contactEmail && (
                <p>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="transition-colors hover:text-gold"
                  >
                    {settings.contactEmail}
                  </a>
                </p>
              )}
              {settings.contactPhone && <p>{settings.contactPhone}</p>}
              {settings.address && <p>{settings.address}</p>}
            </div>
            {socials.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {socials.map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="rounded-lg border border-border p-2 text-muted transition-colors hover:border-gold/40 hover:text-gold"
                  >
                    <SocialIcon name={name} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Explore</h3>
            <ul className="mt-4 space-y-2.5">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    className="text-sm text-muted transition-colors hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Account</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/login" className="text-sm text-muted transition-colors hover:text-gold">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-muted transition-colors hover:text-gold">
                  Create account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-muted transition-colors hover:text-gold">
                  Client dashboard
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="text-sm text-muted transition-colors hover:text-gold">
                  Investment calculator
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted transition-colors hover:text-gold">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card/60 p-4">
          <p className="text-xs leading-relaxed text-faint">
            <span className="font-semibold text-muted">Risk notice: </span>
            {settings.riskNotice}
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-faint sm:flex-row">
          <p>{settings.copyright}</p>
          <p>{settings.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
