import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => ({
  contactMessage: { create: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "@/app/api/contact/route";

function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const valid = {
  name: "Real Person",
  email: "real@example.com",
  message: "A genuine enquiry about the platform.",
};

beforeEach(() => vi.clearAllMocks());

describe("POST /api/contact", () => {
  it("stores a valid submission", async () => {
    prismaMock.contactMessage.create.mockResolvedValue({ id: "m1" });
    const res = await POST(makeRequest(valid, { "x-forwarded-for": "10.0.0.1" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(prismaMock.contactMessage.create).toHaveBeenCalledOnce();
  });

  it("rejects a cross-origin request with 403", async () => {
    const res = await POST(
      makeRequest(valid, { origin: "https://evil.com", "x-forwarded-for": "10.0.0.2" }),
    );
    expect(res.status).toBe(403);
    expect(prismaMock.contactMessage.create).not.toHaveBeenCalled();
  });

  it("returns 400 with field errors for invalid input", async () => {
    const res = await POST(
      makeRequest({ name: "X", email: "bad", message: "" }, { "x-forwarded-for": "10.0.0.3" }),
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { errors?: Record<string, string> };
    expect(json.errors).toBeDefined();
    expect(prismaMock.contactMessage.create).not.toHaveBeenCalled();
  });

  it("silently accepts a honeypot submission without storing it", async () => {
    const res = await POST(
      makeRequest({ ...valid, company: "ACME" }, { "x-forwarded-for": "10.0.0.4" }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(prismaMock.contactMessage.create).not.toHaveBeenCalled();
  });

  it("returns 400 on a malformed JSON body", async () => {
    const res = await POST(makeRequest("not json", { "x-forwarded-for": "10.0.0.5" }));
    expect(res.status).toBe(400);
  });

  it("returns 500 when the database write fails", async () => {
    prismaMock.contactMessage.create.mockRejectedValue(new Error("db down"));
    const res = await POST(makeRequest(valid, { "x-forwarded-for": "10.0.0.6" }));
    expect(res.status).toBe(500);
  });

  it("rate-limits after 5 submissions from one IP", async () => {
    prismaMock.contactMessage.create.mockResolvedValue({ id: "m" });
    const ip = "10.0.0.99";
    for (let i = 0; i < 5; i++) {
      const res = await POST(makeRequest(valid, { "x-forwarded-for": ip }));
      expect(res.status).toBe(200);
    }
    const blocked = await POST(makeRequest(valid, { "x-forwarded-for": ip }));
    expect(blocked.status).toBe(429);
  });
});
