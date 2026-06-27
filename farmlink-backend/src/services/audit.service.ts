import { type Prisma, type PrismaClient } from '@prisma/client';
import { prisma } from '../config/database';

export interface AuditEntry {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}

type PrismaLike = PrismaClient | Prisma.TransactionClient;

// Records significant administrative actions and major status transitions.
export async function recordAudit(entry: AuditEntry, client: PrismaLike = prisma): Promise<void> {
  await client.auditLog.create({
    data: {
      actorUserId: entry.actorUserId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      metadata: entry.metadata ?? undefined,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
    },
  });
}
