import { apiClient } from './api-client';

export interface Home {
  id: string;
  createdBy: string;
  name: string;
  stratum: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomeMember {
  id: string;
  homeId: string;
  userId: string;
  role: string;
  status: string;
  invitedBy: string | null;
  invitedAt: string | null;
  acceptedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  homeId: string;
  role: 'MEMBER' | 'GUEST';
  status: string;
  invitedBy: string;
  invitedAt: string;
}

export const listHomes = () => apiClient<Home[]>('/homes');
export const getHome = (homeId: string) => apiClient<Home>(`/homes/${encodeURIComponent(homeId)}`);
export const createHome = (payload: { name: string; stratum: number }) =>
  apiClient<Home>('/homes', { method: 'POST', body: payload });
export const updateHome = (homeId: string, payload: { name?: string; stratum?: number }) =>
  apiClient<Home>(`/homes/${encodeURIComponent(homeId)}`, { method: 'PATCH', body: payload });
export const leaveHome = (homeId: string) =>
  apiClient<void>(`/homes/${encodeURIComponent(homeId)}/members/me/leave`, { method: 'PATCH' });
export const listMembers = (homeId: string) =>
  apiClient<HomeMember[]>(`/homes/${encodeURIComponent(homeId)}/members`);
export const inviteMember = (homeId: string, payload: { email: string; role: 'MEMBER' | 'GUEST' }) =>
  apiClient<HomeMember>(`/homes/${encodeURIComponent(homeId)}/invitations`, { method: 'POST', body: payload });
export const updateMemberRole = (homeId: string, memberId: string, role: 'OWNER' | 'MEMBER' | 'GUEST') =>
  apiClient<HomeMember>(`/homes/${encodeURIComponent(homeId)}/members/${encodeURIComponent(memberId)}/role`, { method: 'PATCH', body: { role } });
export const revokeMember = (homeId: string, memberId: string) =>
  apiClient<void>(`/homes/${encodeURIComponent(homeId)}/members/${encodeURIComponent(memberId)}/revoke`, { method: 'PATCH' });
export const listInvitations = () => apiClient<Invitation[]>('/invitations');
export const acceptInvitation = (memberId: string) =>
  apiClient<void>(`/invitations/${encodeURIComponent(memberId)}/accept`, { method: 'PATCH' });
export const rejectInvitation = (memberId: string) =>
  apiClient<void>(`/invitations/${encodeURIComponent(memberId)}/reject`, { method: 'PATCH' });
