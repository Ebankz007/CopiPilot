"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({
  items,
  className,
}: {
  items: { id: string; question: string; answer: string }[];
  className?: string;
}) {
  const [open, setOpen] = React.useState<string | null>(items[0]?.id ?? null);

  return (
    <div className={cn("divide-y divide-border rounded-2xl border border-border bg-card", className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-elevated/50"
            >
              <span className="font-medium text-foreground">{item.question}</span>
              <Plus
                className={cn(
                  "h-4 w-4 shrink-0 text-brand transition-transform duration-300",
                  isOpen && "rotate-45",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-muted">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
