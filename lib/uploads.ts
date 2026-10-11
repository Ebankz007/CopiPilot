import path from "node:path";

/**
 * On-disk storage for uploaded media.
 *
 * The destination depends on the runtime `UPLOAD_DIR` env var, which makes it
 * invisible to Turbopack's static analysis. Without the `turbopackIgnore`
 * hints below, the bundler assumes the dynamic path could reach any file and
 * traces the *entire* project (including `public/`) into the server output.
 * Keeping the resolution in one place means the opt-out lives here only.
 */

const DEFAULT_UPLOAD_DIR = "./public/uploads";

export function getUploadDir(): string {
  const configured = process.env.UPLOAD_DIR?.trim() || DEFAULT_UPLOAD_DIR;
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

export function getUploadPath(filename: string): string {
  return path.join(/* turbopackIgnore: true */ getUploadDir(), filename);
}

export function getMaxUploadBytes(): number {
  const mb = Number(process.env.MAX_UPLOAD_MB ?? 5);
  return (Number.isFinite(mb) && mb > 0 ? mb : 5) * 1024 * 1024;
}
