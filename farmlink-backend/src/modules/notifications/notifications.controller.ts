import { type Request, type Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { successResponse, buildPaginationMeta } from '../../utils/api-response';
import { ApiError } from '../../utils/api-error';
import { getParam } from '../../utils/http';
import { paginationQuerySchema, toPrismaPagination } from '../../utils/pagination';
import { notificationService } from '../../services/notification.service';

function requireUserId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const query = paginationQuerySchema.parse(req.query);
  const { items, total } = await notificationService.list(
    requireUserId(req),
    toPrismaPagination(query),
  );
  successResponse(res, {
    message: 'Notifications retrieved',
    data: { notifications: items },
    meta: buildPaginationMeta(total, query.page, query.limit),
  });
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.unreadCount(requireUserId(req));
  successResponse(res, { message: 'Unread count retrieved', data: { unread: count } });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const updated = await notificationService.markAsRead(requireUserId(req), getParam(req, 'notificationId'));
  if (!updated) throw ApiError.notFound('Notification not found');
  successResponse(res, { message: 'Notification marked as read', data: { updated: true } });
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.markAllAsRead(requireUserId(req));
  successResponse(res, { message: 'All notifications marked as read', data: { updated: count } });
});
