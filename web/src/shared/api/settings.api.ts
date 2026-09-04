import { apiClient } from './api-client';

export const getSettings = () => apiClient('/settings');

export const updateSettings = (payload) =>
  apiClient('/settings', { method: 'PATCH', body: payload });
