import { Badge, type BadgeTone } from "@/components/ui/badge";

const TONES: Record<string, BadgeTone> = {
  PENDING: "warning",
  ACTIVE: "success",
  COMPLETED: "brand",
  APPROVED: "success",
  REJECTED: "danger",
  FAILED: "danger",
  CANCELLED: "neutral",
  NEW: "brand",
  READ: "neutral",
  ARCHIVED: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={TONES[status] ?? "neutral"}>{status}</Badge>;
}
