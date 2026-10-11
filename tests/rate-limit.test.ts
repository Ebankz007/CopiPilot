import { describe, it, expect, vi } from "vitest";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows up to the limit, then blocks", () => {
    const key = `test:${Math.random()}`;
    expect(rateLimit(key, 2, 1000).ok).toBe(true);
    expect(rateLimit(key, 2, 1000).ok).toBe(true);
    const third = rateLimit(key, 2, 1000);
    expect(third.ok).toBe(false);
    expect(third.remaining).toBe(0);
    expect(third.retryAfter).toBeGreaterThan(0);
  });

  it("decrements remaining", () => {
    const key = `test:${Math.random()}`;
    expect(rateLimit(key, 3, 1000).remaining).toBe(2);
    expect(rateLimit(key, 3, 1000).remaining).toBe(1);
    expect(rateLimit(key, 3, 1000).remaining).toBe(0);
  });

  it("resets after the window elapses", () => {
    vi.useFakeTimers();
    try {
      const key = `test:${Math.random()}`;
      expect(rateLimit(key, 1, 1000).ok).toBe(true);
      expect(rateLimit(key, 1, 1000).ok).toBe(false);
      vi.advanceTimersByTime(1001);
      expect(rateLimit(key, 1, 1000).ok).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("tracks keys independently", () => {
    const a = `a:${Math.random()}`;
    const b = `b:${Math.random()}`;
    expect(rateLimit(a, 1, 1000).ok).toBe(true);
    expect(rateLimit(a, 1, 1000).ok).toBe(false);
    expect(rateLimit(b, 1, 1000).ok).toBe(true);
  });
});

describe("getClientIp", () => {
  it("prefers the first x-forwarded-for entry", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(h)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const h = new Headers({ "x-real-ip": "9.9.9.9" });
    expect(getClientIp(h)).toBe("9.9.9.9");
  });

  it("falls back to cf-connecting-ip", () => {
    const h = new Headers({ "cf-connecting-ip": "8.8.8.8" });
    expect(getClientIp(h)).toBe("8.8.8.8");
  });

  it("returns 'unknown' when no header is present", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
