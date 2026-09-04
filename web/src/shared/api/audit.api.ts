import { apiClient } from './api-client';

export const listAuditEvents = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient(`/audit${query ? `?${query}` : ''}`);
};
