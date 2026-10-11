import { randomBytes, createHash } from "node:crypto";

/** Opaque, high-entropy token for sessions / password resets. */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

/** SHA-256 hash used to store tokens at rest (never store the raw token). */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
