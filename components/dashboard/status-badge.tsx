import { Badge, type BadgeTone } from "@/components/ui/badge";

const TONES: Record<string, BadgeTone> = {
  PENDING: "warning",
  ACTIVE: "success",
  COMPLETED: "gold",
  APPROVED: "success",
  REJECTED: "danger",
  FAILED: "danger",
  CANCELLED: "neutral",
  NEW: "gold",
  READ: "neutral",
  ARCHIVED: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={TONES[status] ?? "neutral"}>{status}</Badge>;
}
