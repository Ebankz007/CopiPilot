import { describe, it, expect } from "vitest";
import { generateToken, hashToken } from "@/lib/tokens";

describe("generateToken", () => {
  it("returns a hex string of 2*bytes length", () => {
    expect(generateToken(32)).toMatch(/^[0-9a-f]{64}$/);
    expect(generateToken(16)).toMatch(/^[0-9a-f]{32}$/);
  });

  it("defaults to 32 bytes", () => {
    expect(generateToken()).toHaveLength(64);
  });

  it("produces distinct tokens", () => {
    expect(generateToken()).not.toBe(generateToken());
  });
});

describe("hashToken", () => {
  it("is deterministic", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
  });

  it("produces a 64-char hex sha256 digest", () => {
    expect(hashToken("abc")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("differs for different inputs", () => {
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
  });
});
