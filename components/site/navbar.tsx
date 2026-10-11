"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { ButtonLink } from "@/components/ui/button";

type NavItem = { id: string; label: string; url: string; isExternal: boolean };

export function Navbar({
  items,
  siteName,
  isAuthed = false,
}: {
  items: NavItem[];
  siteName: string;
  isAuthed?: boolean;
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = React.useState(pathname);

  // Close the mobile sheet whenever navigation lands on a new route.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "glass border-b border-border" : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${siteName} home`}>
          <Logo siteName={siteName} />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {items.map((item) => {
            const active =
              item.url === "/"
                ? pathname === "/"
                : pathname.startsWith(item.url) && item.url !== "/";
            return (
              <Link
                key={item.id}
                href={item.url}
                target={item.isExternal ? "_blank" : undefined}
                rel={item.isExternal ? "noopener noreferrer" : undefined}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors hover:bg-elevated hover:text-foreground",
                  active ? "text-brand" : "text-muted",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthed ? (
            <ButtonLink href="/dashboard" variant="primary" size="sm">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink href="/register" variant="primary" size="sm">
                Get Private Access
              </ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-foreground lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile sheet */}
      <div
        className={cn(
          "glass overflow-hidden border-t border-border lg:hidden",
          open ? "max-h-[80vh]" : "max-h-0 border-transparent",
          "transition-[max-height] duration-300 ease-out",
        )}
      >
        <div className="space-y-1 px-4 py-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              target={item.isExternal ? "_blank" : undefined}
              rel={item.isExternal ? "noopener noreferrer" : undefined}
              className="block rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-elevated"
            >
              {item.label}
            </Link>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-3">
            {isAuthed ? (
              <ButtonLink href="/dashboard" variant="primary" size="md" className="col-span-2">
                <LayoutDashboard className="h-4 w-4" />
                Go to dashboard
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href="/login" variant="secondary" size="md">
                  Sign in
                </ButtonLink>
                <ButtonLink href="/register" variant="primary" size="md">
                  Get Private Access
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
