import { apiClient } from './api-client';

export type NotificationStatus =
  | 'UNREAD'
  | 'READ'
  | 'DISMISSED';

export interface Notification {
  id: string;
  userId: string;
  alertId: string | null;
  homeId: string | null;
  deviceId: string | null;
  type: string;
  title: string;
  message: string;
  status: NotificationStatus;
  priority: string;
  channel: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnreadNotificationsCount {
  unreadCount: number;
}

export interface MarkAllNotificationsAsReadResponse {
  updatedCount: number;
}

interface ListNotificationsQuery {
  status?: NotificationStatus;
  limit?: number;
}

const buildQueryString = ({
  status,
  limit,
}: ListNotificationsQuery) => {
  const params = new URLSearchParams();

  if (status) {
    params.set('status', status);
  }

  if (limit !== undefined) {
    params.set('limit', String(limit));
  }

  const query = params.toString();

  return query ? `?${query}` : '';
};

export const listNotifications = (
  query: ListNotificationsQuery = {},
) =>
  apiClient<Notification[]>(
    `/notifications${buildQueryString(query)}`,
  );

export const getUnreadNotificationsCount = () =>
  apiClient<UnreadNotificationsCount>(
    '/notifications/unread-count',
  );

export const markAllNotificationsAsRead = () =>
  apiClient<MarkAllNotificationsAsReadResponse>(
    '/notifications/read-all',
    {
      method: 'PATCH',
    },
  );

export const markNotificationAsRead = (
  notificationId: string,
) =>
  apiClient<Notification>(
    `/notifications/${encodeURIComponent(
      notificationId,
    )}/read`,
    {
      method: 'PATCH',
    },
  );

export const dismissNotification = (
  notificationId: string,
) =>
  apiClient<Notification>(
    `/notifications/${encodeURIComponent(
      notificationId,
    )}/dismiss`,
    {
      method: 'PATCH',
    },
  );