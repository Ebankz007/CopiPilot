export type ActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

/** Split a textarea value into a trimmed, non-empty string array. */
export function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Split a comma-separated value into a trimmed, non-empty string array. */
export function csv(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function str(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export function nullable(value: FormDataEntryValue | null): string | null {
  const v = str(value);
  return v.length ? v : null;
}
