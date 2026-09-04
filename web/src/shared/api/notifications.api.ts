import { apiClient } from './api-client';

export const listNotifications = () => apiClient('/notifications');

export const markNotificationRead = (notificationId) =>
  apiClient(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'PATCH' });
