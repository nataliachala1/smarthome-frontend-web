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

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface ActivateAccountResponse {
  activated: boolean;
}

export interface ResendActivationResponse {
  sent: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  sent: boolean;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  passwordConfirmation: string;
}

export interface ResetPasswordResponse {
  reset: boolean;
}

export const login = (credentials: LoginCredentials) =>
  apiClient<AuthResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
  });

export const register = (payload: RegisterPayload) =>
  apiClient<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: payload,
  });

export const activateAccount = (token: string) =>
  apiClient<ActivateAccountResponse>('/auth/activate', {
    method: 'POST',
    body: { token },
  });

export const resendActivation = (email: string) =>
  apiClient<ResendActivationResponse>('/auth/resend-activation', {
    method: 'POST',
    body: { email },
  });

export const forgotPassword = (payload: ForgotPasswordPayload) =>
  apiClient<ForgotPasswordResponse>('/auth/forgot-password', {
    method: 'POST',
    body: payload,
  });

export const resetPassword = (payload: ResetPasswordPayload) =>
  apiClient<ResetPasswordResponse>('/auth/reset-password', {
    method: 'POST',
    body: payload,
  });

export const getCurrentUser = () => apiClient<CurrentUser>('/auth/me');
export interface RefreshSessionResponse {
  accessToken: string;
  tokenType: 'Bearer';
}

export interface LogoutResponse {
  message: string;
}

export const refreshSession = () =>
  apiClient<RefreshSessionResponse>('/auth/refresh', {
    method: 'POST',
  });

export const logout = () =>
  apiClient<LogoutResponse>('/auth/logout', {
    method: 'POST',
  });

export const logoutAll = () =>
  apiClient<LogoutResponse>('/auth/logout-all', {
    method: 'POST',
  });
