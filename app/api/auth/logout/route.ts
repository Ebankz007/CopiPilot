import { destroyUserSession } from "@/lib/auth";
import { isSameOrigin, errorJson, json } from "@/lib/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorJson("Invalid request origin", 403);
  await destroyUserSession();
  return json({ ok: true });
}
