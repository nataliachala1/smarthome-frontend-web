import { apiClient } from './api-client';

export const getConsumption = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiClient(`/consumption${query ? `?${query}` : ''}`);
};
