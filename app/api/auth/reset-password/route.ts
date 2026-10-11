import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { resetPasswordSchema } from "@/lib/validators";
import { hashToken } from "@/lib/tokens";
import { destroyAllUserSessions } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { errorJson, firstZodError, isSameOrigin, json } from "@/lib/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorJson("Invalid request origin", 403);

  const ip = getClientIp(request.headers);
  const limit = rateLimit(`reset:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.ok) {
    return errorJson(`Too many attempts. Try again in ${limit.retryAfter}s.`, 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorJson("Invalid request body");
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return json({ error: firstZodError(parsed.error), errors }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const record = await prisma.passwordReset.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (
    !record ||
    record.scope !== "user" ||
    record.usedAt ||
    record.expiresAt < new Date() ||
    !record.userId
  ) {
    return errorJson("This reset link is invalid or has expired.", 400);
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  // Any session issued before the reset is now suspect.
  await destroyAllUserSessions(record.userId);

  return json({ ok: true });
}
