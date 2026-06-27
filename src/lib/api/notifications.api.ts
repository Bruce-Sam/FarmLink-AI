import { apiGet, apiPatch } from './client';
import type { Notification } from '@/types/notification';
import { mapBackendNotification } from './mappers/backend-mappers';

export async function getNotifications(): Promise<Notification[]> {
  const response = await apiGet<{ notifications: Record<string, unknown>[] }>('/notifications');
  return (response.data.notifications ?? []).map(mapBackendNotification);
}

export async function markNotificationRead(id: string): Promise<Notification> {
  await apiPatch<{ updated: boolean }>(`/notifications/${id}/read`);
  const notifications = await getNotifications();
  const found = notifications.find((n) => n.id === id);
  if (!found) {
    throw new Error('Notification not found after marking as read');
  }
  return found;
}

export async function markAllNotificationsRead(): Promise<Notification[]> {
  await apiPatch<{ updated: number }>('/notifications/read-all');
  return getNotifications();
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await apiGet<{ unread: number }>('/notifications/unread-count');
  return response.data.unread;
}
