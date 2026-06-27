import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uuidParam } from '../../utils/common-schemas';
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './notifications.controller';

const router = Router();

router.use(authenticate);
router.get('/', listNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllNotificationsRead);
router.patch(
  '/:notificationId/read',
  validate({ params: uuidParam('notificationId') }),
  markNotificationRead,
);

export const notificationsRoutes = router;
