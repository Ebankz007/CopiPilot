import { describe, it, expect } from "vitest";
import {
  emailField,
  passwordField,
  loginSchema,
  registerSchema,
  contactSchema,
  adminLoginSchema,
  pageSchema,
  faqSchema,
  strategySchema,
  calculatorSettingsSchema,
  blogPostSchema,
  statSchema,
  navItemSchema,
  settingsSchema,
} from "@/lib/validators";

describe("emailField", () => {
  it("trims and lowercases a valid address", () => {
    expect(emailField.parse("  Henry@Example.COM  ")).toBe("henry@example.com");
  });

  it("rejects a malformed address with a friendly message", () => {
    const result = emailField.safeParse("not-an-email");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Enter a valid email address");
    }
  });

  it("rejects an address longer than 200 characters", () => {
    const long = `${"a".repeat(200)}@example.com`;
    expect(emailField.safeParse(long).success).toBe(false);
  });
});

describe("passwordField", () => {
  it("accepts 8+ characters", () => {
    expect(passwordField.safeParse("abcd1234").success).toBe(true);
  });

  it("rejects fewer than 8 characters", () => {
    const result = passwordField.safeParse("short");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Password must be at least 8 characters",
      );
    }
  });
});

describe("loginSchema", () => {
  it("requires a non-empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts a minimal registration (phone and country optional)", () => {
    const parsed = registerSchema.parse({
      fullName: "Jane Doe",
      email: "jane@example.com",
      password: "abcd1234",
    });
    expect(parsed.fullName).toBe("Jane Doe");
    expect(parsed.phone).toBeUndefined();
    expect(parsed.country).toBeUndefined();
  });

  it("accepts optional phone and country", () => {
    const parsed = registerSchema.parse({
      fullName: "Jane Doe",
      email: "jane@example.com",
      password: "abcd1234",
      phone: "+1 555 0100",
      country: "United States",
    });
    expect(parsed.phone).toBe("+1 555 0100");
    expect(parsed.country).toBe("United States");
  });

  it("rejects a name that is too short", () => {
    const result = registerSchema.safeParse({
      fullName: "J",
      email: "jane@example.com",
      password: "abcd1234",
    });
    expect(result.success).toBe(false);
  });
});

describe("contactSchema", () => {
  const base = {
    name: "Real Person",
    email: "real@example.com",
    message: "A genuine enquiry about the platform.",
  };

  it("accepts a valid submission", () => {
    expect(contactSchema.safeParse(base).success).toBe(true);
  });

  it("requires a message of at least 10 characters", () => {
    const result = contactSchema.safeParse({ ...base, message: "too short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message === "Please tell us a little more")).toBe(true);
    }
  });

  // Regression guard: the honeypot must NOT fail validation, otherwise the
  // route's silent-discard branch is dead code and a bot learns it was caught.
  it("accepts a filled honeypot so the route can silently discard it", () => {
    const result = contactSchema.safeParse({ ...base, company: "ACME Corp" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company).toBe("ACME Corp");
    }
  });

  it("accepts an empty honeypot", () => {
    expect(contactSchema.safeParse({ ...base, company: "" }).success).toBe(true);
  });
});

describe("adminLoginSchema", () => {
  it("normalises the email", () => {
    const parsed = adminLoginSchema.parse({ email: " Admin@CopiPilot.COM ", password: "x" });
    expect(parsed.email).toBe("admin@copipilot.com");
  });
});

describe("pageSchema slug", () => {
  it.each(["about", "about-us", "pricing-2026", "a1-b2"])(
    "accepts %s",
    (slug) => {
      expect(pageSchema.safeParse({ slug, title: "T", content: "" }).success).toBe(true);
    },
  );

  it.each(["About Us", "about_us", "-about", "about-", "Über"])(
    "rejects %s",
    (slug) => {
      expect(pageSchema.safeParse({ slug, title: "T", content: "" }).success).toBe(false);
    },
  );

  it("defaults status to DRAFT", () => {
    const parsed = pageSchema.parse({ slug: "about", title: "T", content: "" });
    expect(parsed.status).toBe("DRAFT");
  });
});

describe("coercion", () => {
  it("coerces faq order from a string", () => {
    const parsed = faqSchema.parse({ question: "Question?", answer: "Answer.", order: "3" });
    expect(parsed.order).toBe(3);
  });

  it("coerces strategy min investment from a string and applies defaults", () => {
    const parsed = strategySchema.parse({
      name: "Income & Yield",
      slug: "income-yield",
      shortDescription: "Steady income",
      description: "Long form description",
      minInvestment: "250",
    });
    expect(parsed.minInvestment).toBe(250);
    expect(parsed.riskLevel).toBe("MEDIUM");
    expect(parsed.status).toBe("ACTIVE");
    expect(parsed.ctaLabel).toBe("Get started");
  });

  it("rejects a strategy with a negative minimum", () => {
    expect(
      strategySchema.safeParse({
        name: "X",
        slug: "x",
        shortDescription: "s",
        description: "d",
        minInvestment: "-1",
      }).success,
    ).toBe(false);
  });

  it("parses calculator settings with coerced months", () => {
    const parsed = calculatorSettingsSchema.parse({
      defaultAmount: "1000",
      minAmount: "100",
      maxAmount: "500000",
      defaultMonths: "12",
      availableMonths: ["1", "3", "12"],
      defaultRate: "2.5",
      minRate: "0.1",
      maxRate: "20",
      disclaimer: "Estimates only.",
    });
    expect(parsed.defaultAmount).toBe(1000);
    expect(parsed.availableMonths).toEqual([1, 3, 12]);
    expect(parsed.allowCompound).toBe(true);
  });

  it("defaults blog post status to DRAFT and author to the desk", () => {
    const parsed = blogPostSchema.parse({
      title: "Risk",
      slug: "risk",
      excerpt: "Why risk matters",
      content: "Body",
    });
    expect(parsed.status).toBe("DRAFT");
    expect(parsed.authorName).toBe("CopiPilot Desk");
    expect(parsed.tags).toEqual([]);
  });

  it("defaults stat order to 0", () => {
    const parsed = statSchema.parse({ label: "Win rate", value: "68" });
    expect(parsed.order).toBe(0);
    expect(parsed.isEnabled).toBe(true);
  });

  it("defaults nav location to HEADER", () => {
    const parsed = navItemSchema.parse({ label: "Home", url: "/" });
    expect(parsed.location).toBe("HEADER");
  });
});

describe("settingsSchema", () => {
  it("defaults socials to an empty object", () => {
    const parsed = settingsSchema.parse({
      siteName: "CopiPilot",
      tagline: "",
      logoUrl: "",
      faviconUrl: "",
      contactEmail: "",
      contactPhone: "",
      whatsapp: "",
      telegram: "",
      footerText: "",
      copyright: "",
      defaultSeoTitle: "",
      defaultSeoDescription: "",
      gaId: "",
      riskNotice: "",
      primaryColor: "",
    });
    expect(parsed.socials).toEqual({});
  });
});
