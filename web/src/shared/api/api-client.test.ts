import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient, getApiBaseUrl } from './api-client';
import { ApiError, isApiError } from './errors';

type Reply = { status: number; body?: unknown };

function jsonResponse({ status, body }: Reply): Response {
  if (status === 204) return new Response(null, { status });
  return new Response(JSON.stringify(body ?? {}), { status, headers: { 'content-type': 'application/json' } });
}

/** Queues fetch answers and records every request. */
function mockFetch(...replies: Reply[]) {
  const fetchMock = vi.fn((...request: [string, RequestInit?]) => {
    void request;
    const next = replies.shift();
    if (!next) throw new Error('unexpected fetch');
    return Promise.resolve(jsonResponse(next));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const authHeader = (init?: RequestInit) => new Headers(init?.headers).get('Authorization');

describe('apiClient', () => {
  let assign: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, pathname: '/dashboard', assign });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('uses /api/v1 as the default base URL', () => {
    expect(getApiBaseUrl()).toBe('/api/v1');
  });

  it('sends JSON with the stored access token and cookies', async () => {
    localStorage.setItem('token', 'access-1');
    const fetchMock = mockFetch({ status: 200, body: { ok: true } });

    await expect(apiClient('/homes', { method: 'POST', body: { name: 'Casa' } })).resolves.toEqual({ ok: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/homes');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe('{"name":"Casa"}');
    expect(authHeader(init)).toBe('Bearer access-1');
    expect(new Headers(init?.headers).get('Content-Type')).toBe('application/json');
  });

  it('returns null for 204 responses and text for non-JSON bodies', async () => {
    mockFetch({ status: 204 });
    await expect(apiClient('/notifications/read-all', { method: 'PATCH' })).resolves.toBeNull();

    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('pong', { status: 200 }))));
    await expect(apiClient('/health')).resolves.toBe('pong');
  });

  it('refreshes an expired token once and retries the request', async () => {
    localStorage.setItem('token', 'expired');
    const fetchMock = mockFetch(
      { status: 401, body: { message: 'Token expirado' } },
      { status: 200, body: { accessToken: 'fresh' } },
      { status: 200, body: [{ id: 'h1' }] },
    );

    await expect(apiClient('/homes')).resolves.toEqual([{ id: 'h1' }]);

    expect(fetchMock.mock.calls[1][0]).toBe('/api/v1/auth/refresh');
    expect(authHeader(fetchMock.mock.calls[2][1])).toBe('Bearer fresh');
    expect(localStorage.getItem('token')).toBe('fresh');
  });

  it('shares a single refresh between concurrent 401 responses', async () => {
    localStorage.setItem('token', 'expired');
    const fetchMock = mockFetch(
      { status: 401 },
      { status: 401 },
      { status: 200, body: { accessToken: 'fresh' } },
      { status: 200, body: 'a' },
      { status: 200, body: 'b' },
    );

    await Promise.all([apiClient('/homes'), apiClient('/devices')]);

    const refreshCalls = fetchMock.mock.calls.filter(([url]) => url === '/api/v1/auth/refresh');
    expect(refreshCalls).toHaveLength(1);
  });

  it('clears the session and redirects to /login when the refresh fails', async () => {
    localStorage.setItem('token', 'expired');
    localStorage.setItem('user', '{"id":"u1"}');
    mockFetch({ status: 401 }, { status: 401 }, );

    await expect(apiClient('/homes')).rejects.toMatchObject({ status: 401 });
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(assign).toHaveBeenCalledWith('/login');
  });

  it('ignores a refresh response without an access token', async () => {
    localStorage.setItem('token', 'expired');
    mockFetch({ status: 401 }, { status: 200, body: { accessToken: '' } });
    await expect(apiClient('/homes')).rejects.toBeInstanceOf(ApiError);
    expect(assign).toHaveBeenCalledWith('/login');
  });

  it('never refreshes or redirects for authentication endpoints', async () => {
    const fetchMock = mockFetch({ status: 401, body: { message: 'Credenciales inválidas' } });
    await expect(apiClient('/auth/login', { method: 'POST', body: {} })).rejects.toThrow('Credenciales inválidas');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(assign).not.toHaveBeenCalled();
  });

  it.each([
    [{ status: 409, body: { message: 'Ya existe' } }, 'Ya existe'],
    [{ status: 403, body: {} }, 'No tienes permisos para realizar esta acción.'],
    [{ status: 500, body: {} }, 'Solicitud fallida (500)'],
  ])('turns error responses into ApiError (%j)', async (reply, message) => {
    mockFetch(reply);
    const error: unknown = await apiClient('/homes').catch((e: unknown) => e);
    expect(isApiError(error)).toBe(true);
    expect(error).toMatchObject({ message, status: reply.status, details: reply.body });
  });
});

describe('ApiError', () => {
  it('keeps status and details', () => {
    const error = new ApiError('boom', { status: 418, details: { a: 1 } });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(isApiError(error)).toBe(true);
    expect(isApiError(new Error('x'))).toBe(false);
  });
});
