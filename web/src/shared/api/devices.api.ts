import { apiClient } from './api-client';

export const listDevices = (homeId) =>
  apiClient(`/homes/${encodeURIComponent(homeId)}/devices`);
