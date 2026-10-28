import { apiClient } from './api-client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PreferenceLanguage = 'es' | 'en' | 'fr' | 'de';
export type PreferenceTheme = 'claro' | 'oscuro' | 'automatico';
export type PreferenceTimeFormat = '12h' | '24h';

export interface UserPreferences {
  userId: string;
  language: PreferenceLanguage;
  theme: PreferenceTheme;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: PreferenceTimeFormat;
  timezone: string;
}

export type UpdateUserPreferences = Partial<
  Omit<UserPreferences, 'userId'>
>;

export interface DeactivateAccountResponse {
  message: string;
  status: string;
  deactivatedAt: string;
}

export const getMyProfile = () =>
  apiClient<UserProfile>('/users/me');

export const updateMyProfile = (payload: { name?: string }) =>
  apiClient<UserProfile>('/users/me', {
    method: 'PATCH',
    body: payload,
  });

export const getMyPreferences = () =>
  apiClient<UserPreferences>('/users/me/preferences');

export const updateMyPreferences = (payload: UpdateUserPreferences) =>
  apiClient<UserPreferences>('/users/me/preferences', {
    method: 'PATCH',
    body: payload,
  });

export const deactivateMyAccount = () =>
  apiClient<DeactivateAccountResponse>('/users/me/deactivate', {
    method: 'PATCH',
    body: { confirm: true },
  });
