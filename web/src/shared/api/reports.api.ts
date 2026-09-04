import { apiClient } from './api-client';

export const getReport = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient(`/reports${query ? `?${query}` : ''}`);
};
