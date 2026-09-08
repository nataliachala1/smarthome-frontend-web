import { apiClient } from './api-client';

export interface AuthUser {
  id: string;
  name?: string;
  email: string;
  role?: string;
  [key: string]: unknown;
}

export interface CurrentUser {
  userId: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  user: AuthUser;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  status: string;
  emailVerified: boolean;
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
  apiClient<RegisterResponse>('/auth/register', { method: 'POST', body: payload });

export const activateAccount = (token: string) =>
  apiClient<{ message?: string }>('/auth/activate', { method: 'POST', body: { token } });
export const resendActivation = (email: string) =>
  apiClient<{ message?: string }>('/auth/resend-activation', { method: 'POST', body: { email } });
export const getCurrentUser = () => apiClient<CurrentUser>('/auth/me');
