import { apiClient } from './api-client';

export interface AuthUser {
  id: string;
  name?: string;
  email: string;
  role?: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  access_token?: string;
  accessToken?: string;
  token?: string;
  user?: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginCredentials {
  name: string;
}

export const login = (credentials: LoginCredentials) =>
  apiClient<AuthResponse>('/auth/login', { method: 'POST', body: credentials });

export const register = (payload: RegisterPayload) =>
  apiClient<AuthResponse>('/auth/register', { method: 'POST', body: payload });

export const requestPasswordReset = (email: string) =>
  apiClient<unknown>('/auth/forgot-password', { method: 'POST', body: { email } });

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export const resetPassword = (payload: ResetPasswordPayload) =>
  apiClient<unknown>('/auth/reset-password', { method: 'POST', body: payload });
