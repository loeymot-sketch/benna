import { prisma } from './db.js';

export async function audit(input: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  payload?: unknown;
  ipAddress?: string;
  userAgent?: string;
}) {
  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      payload: input.payload ? JSON.stringify(input.payload) : null,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}
