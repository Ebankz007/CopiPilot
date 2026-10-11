import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validators";
import { createUserSession } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { errorJson, firstZodError, isSameOrigin, json } from "@/lib/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorJson("Invalid request origin", 403);

  const ip = getClientIp(request.headers);
  const limit = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  if (!limit.ok) {
    return errorJson(
      `Too many attempts. Try again in ${limit.retryAfter}s.`,
      429,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorJson("Invalid request body");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(firstZodError(parsed.error));
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Constant-ish response regardless of which part failed.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return errorJson("Invalid email or password", 401);
  }
  if (user.status !== "ACTIVE") {
    return errorJson("This account is suspended. Contact support.", 403);
  }

  await createUserSession({ id: user.id, email: user.email, role: user.role });
  return json({ ok: true });
}
