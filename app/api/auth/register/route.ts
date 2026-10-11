import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validators";
import { createUserSession } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { errorJson, firstZodError, isSameOrigin, json } from "@/lib/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorJson("Invalid request origin", 403);

  const ip = getClientIp(request.headers);
  const limit = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return errorJson(
      `Too many sign-ups from this address. Try again in ${limit.retryAfter}s.`,
      429,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorJson("Invalid request body");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return json({ error: firstZodError(parsed.error), errors }, { status: 400 });
  }

  const { fullName, email, password, phone, country } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return json(
      { error: "An account with this email already exists.", errors: { email: "Email already registered" } },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      phone: phone || null,
      country: country || null,
    },
  });

  await createUserSession(
    { id: user.id, email: user.email, role: user.role },
    { ip, userAgent: request.headers.get("user-agent") },
  );
  return json({ ok: true });
}
