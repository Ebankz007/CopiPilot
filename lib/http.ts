import { NextResponse } from "next/server";

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorJson(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Lightweight CSRF guard for state-changing routes: when a browser sends an
 * Origin header, it must match the request host.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host = request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function firstZodError(error: {
  issues: { message: string }[];
}): string {
  return error.issues[0]?.message ?? "Invalid request";
}
