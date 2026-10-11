import { describe, it, expect } from "vitest";
import { isSameOrigin, firstZodError } from "@/lib/http";

function req(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/x", { headers });
}

describe("isSameOrigin", () => {
  it("allows a request with no Origin header", () => {
    expect(isSameOrigin(req({}))).toBe(true);
  });

  it("allows a matching Origin", () => {
    expect(isSameOrigin(req({ origin: "https://copipilot.com", host: "copipilot.com" }))).toBe(true);
  });

  it("rejects a mismatched Origin", () => {
    expect(isSameOrigin(req({ origin: "https://evil.com", host: "copipilot.com" }))).toBe(false);
  });

  it("rejects an unparseable Origin", () => {
    expect(isSameOrigin(req({ origin: "not a url", host: "copipilot.com" }))).toBe(false);
  });
});

describe("firstZodError", () => {
  it("returns the first issue message", () => {
    expect(firstZodError({ issues: [{ message: "first" }, { message: "second" }] })).toBe("first");
  });

  it("falls back when there are no issues", () => {
    expect(firstZodError({ issues: [] })).toBe("Invalid request");
  });
});
