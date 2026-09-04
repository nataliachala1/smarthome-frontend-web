import { apiClient } from './api-client';

export interface Home {
  id: string;
  name?: string;
  [key: string]: unknown;
}

interface HomesResponse {
  data?: Home[];
}

export const listHomes = async (): Promise<Home[]> => {
  const response = await apiClient<Home[] | HomesResponse>('/homes');
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  throw new Error('La respuesta de hogares no tiene el formato esperado.');
};

export const createHome = (payload) =>
  apiClient('/homes', { method: 'POST', body: payload });

export const updateHome = (homeId, payload) =>
  apiClient(`/homes/${encodeURIComponent(homeId)}`, { method: 'PATCH', body: payload });
