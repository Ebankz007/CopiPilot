import { describe, it, expect } from "vitest";
import { lines, csv, str, nullable } from "@/lib/form";

describe("lines", () => {
  it("splits on newlines, trims, and drops blanks", () => {
    expect(lines("a\n  b \n\nc")).toEqual(["a", "b", "c"]);
  });

  it("returns an empty array for null", () => {
    expect(lines(null)).toEqual([]);
  });
});

describe("csv", () => {
  it("splits on commas, trims, and drops blanks", () => {
    expect(csv("a, b ,c")).toEqual(["a", "b", "c"]);
  });

  it("returns an empty array for null", () => {
    expect(csv(null)).toEqual([]);
  });
});

describe("str", () => {
  it("trims and stringifies", () => {
    expect(str("  hi  ")).toBe("hi");
    expect(str(null)).toBe("");
  });
});

describe("nullable", () => {
  it("returns null for blank or missing values", () => {
    expect(nullable("   ")).toBeNull();
    expect(nullable(null)).toBeNull();
  });

  it("returns the trimmed value otherwise", () => {
    expect(nullable(" x ")).toBe("x");
  });
});
