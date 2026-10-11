import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, isStrongPassword } from "@/lib/password";

describe("hashPassword / verifyPassword", () => {
  it("round-trips a correct password", async () => {
    const hash = await hashPassword("abcd1234");
    expect(hash).not.toBe("abcd1234");
    expect(await verifyPassword("abcd1234", hash)).toBe(true);
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("abcd1234");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("salts: the same password hashes differently each time", async () => {
    const a = await hashPassword("abcd1234");
    const b = await hashPassword("abcd1234");
    expect(a).not.toBe(b);
  });
});

describe("isStrongPassword", () => {
  it.each([
    ["abcd1234", true],
    ["Passw0rd", true],
    ["abcdefgh", false], // no digit
    ["12345678", false], // no letter
    ["abc123", false], // too short
  ])("%s -> %s", (password, expected) => {
    expect(isStrongPassword(password)).toBe(expected);
  });
});
