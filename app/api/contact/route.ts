import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validators";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { errorJson, firstZodError, isSameOrigin, json } from "@/lib/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return errorJson("Invalid request origin", 403);
  }

  const ip = getClientIp(request.headers);
  const limit = rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return errorJson(
      `Too many messages. Please try again in ${limit.retryAfter}s.`,
      429,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorJson("Invalid request body");
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return json({ error: firstZodError(parsed.error), errors }, { status: 400 });
  }

  const data = parsed.data;

  // Honeypot tripped — pretend success, store nothing.
  if (data.company) {
    return json({ ok: true });
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject || null,
        message: data.message,
      },
    });
  } catch (error) {
    console.error("[contact] failed to store message", error);
    return errorJson("We couldn't send your message. Please try again.", 500);
  }

  return json({ ok: true });
}
