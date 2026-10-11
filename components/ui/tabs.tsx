"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type Tab = { id: string; label: string; content: React.ReactNode };

export function Tabs({
  tabs,
  initial,
  className,
}: {
  tabs: Tab[];
  initial?: string;
  className?: string;
}) {
  const [active, setActive] = React.useState(initial ?? tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className={className}>
      <div
        role="tablist"
        className="mb-6 inline-flex rounded-xl border border-border bg-elevated p-1"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active === tab.id
                ? "bg-gold-gradient text-black"
                : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{current?.content}</div>
    </div>
  );
}
