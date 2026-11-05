import { ApiError } from './errors';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');

const clearSession = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

const parseResponse = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') || '';

  if (response.status === 204) return null;
  if (contentType.includes('application/json')) return response.json();

  return response.text();
};

export interface ApiClientOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  headers?: HeadersInit;
}

const pathsWithoutRefresh = new Set([
  '/auth/request-reactivation',
  '/auth/reactivate',
  '/auth/login',
  '/auth/register',
  '/auth/activate',
  '/auth/resend-activation',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh',
  '/auth/logout',
]);

const pathsWithoutSessionRedirect = new Set(pathsWithoutRefresh);

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) return null;

        const payload = await parseResponse(response);

        if (
          typeof payload !== 'object' ||
          payload === null ||
          !('accessToken' in payload) ||
          typeof payload.accessToken !== 'string' ||
          payload.accessToken.length === 0
        ) {
          return null;
        }

        localStorage.setItem('token', payload.accessToken);

        return payload.accessToken;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

export const apiClient = async <T = unknown>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> => {
  const { body, headers = {}, ...requestOptions } = options;
  const normalizedPath = path.split('?')[0].replace(/\/+$/, '') || '/';

  const requestBody =
    body === undefined
      ? undefined
      : (typeof body === 'string' ? body : JSON.stringify(body)) as BodyInit;

  const sendRequest = (token: string | null) => {
    const requestHeaders = new Headers(headers);

    if (body !== undefined && !requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json');
    }

    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    return fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      credentials: 'include',
      headers: requestHeaders,
      body: requestBody,
    });
  };

  const tokenUsedForRequest = localStorage.getItem('token');
  let response = await sendRequest(tokenUsedForRequest);

  if (
    response.status === 401 &&
    !pathsWithoutRefresh.has(normalizedPath)
  ) {
    let tokenForRetry = localStorage.getItem('token');

    if (!tokenForRetry || tokenForRetry === tokenUsedForRequest) {
      tokenForRetry = await refreshAccessToken();
    }

    if (tokenForRetry) {
      response = await sendRequest(tokenForRetry);
    } else if (!pathsWithoutSessionRedirect.has(normalizedPath)) {
      clearSession();

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    if (
      response.status === 401 &&
      !pathsWithoutSessionRedirect.has(normalizedPath)
    ) {
      clearSession();

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
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

    throw new ApiError(message, {
      status: response.status,
      details: payload,
    });
  }

  return payload as T;
};

export const getApiBaseUrl = () => API_BASE_URL;
