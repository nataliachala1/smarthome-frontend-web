import { ApiError } from './errors';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');

const clearSession = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (response.status === 204) return null;
  if (contentType.includes('application/json')) return response.json();
  return response.text();
};

export interface ApiClientOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  headers?: HeadersInit;
}

export const apiClient = async <T = unknown>(path: string, options: ApiClientOptions = {}): Promise<T> => {
  const { body, headers = {}, ...requestOptions } = options;
  const token = localStorage.getItem('token');
  const requestHeaders = new Headers(headers);
  const requestBody = body === undefined
    ? undefined
    : (typeof body === 'string' ? body : JSON.stringify(body)) as BodyInit;

  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (token) requestHeaders.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    body: requestBody,
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    const message =
  typeof payload === 'object' &&
  payload !== null &&
  'message' in payload &&
  typeof payload.message === 'string'
    ? payload.message
    : response.status === 403
      ? 'No tienes permisos para realizar esta acción.'
      : `Solicitud fallida (${response.status})`;
      
    throw new ApiError(
      message,
      { status: response.status, details: payload },
    );
  }

  return payload as T;
};

export const getApiBaseUrl = () => API_BASE_URL;
