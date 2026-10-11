import { prisma } from "./prisma";

export type AuditInput = {
  adminId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
};

/**
 * Append an audit entry. Never throws into the caller — auditing must not
 * break a successful mutation.
 */
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: input.adminId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        before: (input.before ?? undefined) as object | undefined,
        after: (input.after ?? undefined) as object | undefined,
        ip: input.ip ?? null,
      },
    });
  } catch (error) {
    console.error("[audit] failed to record", input.action, error);
  }
}
