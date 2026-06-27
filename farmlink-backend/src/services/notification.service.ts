import { type Prisma, type PrismaClient, type NotificationType } from '@prisma/client';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
}

type PrismaLike = PrismaClient | Prisma.TransactionClient;

// In-app notification service. Designed so SMS / email / push adapters can be
// layered on later by extending `dispatch` without touching call sites.
export class NotificationService {
  async create(input: CreateNotificationInput, client: PrismaLike = prisma) {
    const notification = await client.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        metadata: input.metadata ?? undefined,
      },
    });
    logger.info({ userId: input.userId, type: input.type }, 'Notification created');
    return notification;
  }

  async list(userId: string, options: { skip: number; take: number }) {
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: options.skip,
        take: options.take,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { items, total };
  }

  async unreadCount(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, readAt: null } });
  }

  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const result = await prisma.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
    return result.count > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return result.count;
  }
}

export const notificationService = new NotificationService();
