import { describe, it, expect } from "vitest";
import { cn, formatDate, slugify, truncate, formatPrice } from "@/lib/utils";

describe("cn", () => {
  it("merges conflicting tailwind classes (last wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("drops falsy values", () => {
    expect(cn("text-sm", false && "hidden", undefined, "font-bold")).toBe("text-sm font-bold");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
    expect(slugify("  A  B  ")).toBe("a-b");
  });

  it("strips non-ascii characters", () => {
    expect(slugify("Ünïcode")).toBe("ncode");
  });
});

describe("truncate", () => {
  it("leaves short strings untouched", () => {
    expect(truncate("abc", 10)).toBe("abc");
  });

  it("truncates with an ellipsis within the limit", () => {
    const out = truncate("abcdefghij", 5);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(5);
  });
});

describe("formatPrice", () => {
  it("formats USD with a dollar sign", () => {
    expect(formatPrice(49)).toBe("$49");
    expect(formatPrice(1234)).toBe("$1,234");
  });

  it("returns 'Free' for 0, null, and undefined", () => {
    expect(formatPrice(0)).toBe("Free");
    expect(formatPrice(null)).toBe("Free");
    expect(formatPrice(undefined)).toBe("Free");
  });

  it("uses the currency code for non-USD", () => {
    expect(formatPrice(10, "EUR")).toBe("EUR 10");
  });
});

describe("formatDate", () => {
  it("returns an em dash for empty or invalid input", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("not a date")).toBe("—");
  });

  it("formats a valid date", () => {
    expect(formatDate(new Date("2026-01-15T00:00:00Z"))).toMatch(/2026/);
  });
});
