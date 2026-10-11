import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { generateToken, hashToken } from "@/lib/tokens";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { errorJson, firstZodError, isSameOrigin, json } from "@/lib/http";

const RESET_TTL_MS = 1000 * 60 * 60; // 1 hour

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorJson("Invalid request origin", 403);

  const ip = getClientIp(request.headers);
  const limit = rateLimit(`forgot:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return errorJson(`Too many requests. Try again in ${limit.retryAfter}s.`, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorJson("Invalid request body");
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(firstZodError(parsed.error));
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return the same response so the endpoint cannot be used to
  // enumerate which emails have accounts.
  if (user && user.status === "ACTIVE") {
    // Invalidate any outstanding, unused tokens for this account first.
    await prisma.passwordReset.deleteMany({
      where: { email, scope: "user", usedAt: null },
    });

    const token = generateToken(32);
    await prisma.passwordReset.create({
      data: {
        email,
        scope: "user",
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    });

    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3400";
    const resetUrl = `${base}/reset-password?token=${token}`;

    // No mail provider is wired up yet. The reset link is logged so an operator
    // can deliver it out-of-band; replace this with an email send in production.
    console.info(`[auth] password reset link for ${email}: ${resetUrl}`);
  }

  return json({ ok: true });
}
