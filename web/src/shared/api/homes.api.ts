import { apiClient } from './api-client';

export interface Home {
  id: string;
  createdBy: string;
  name: string;
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

export interface HomeMemberMutationResponse {
  id: string;
  homeId: string;
  role: string;
  status: string;
  userId?: string;
  acceptedAt?: string | null;
  endedAt?: string | null;
  updatedAt?: string;
}

export interface Invitation {
  id: string;
  homeId: string;
  role: 'MEMBER' | 'GUEST';
  status: 'PENDING';
  invitedBy: string | null;
  invitedAt: string;
}

export interface InvitationActionResponse {
  id: string;
  homeId: string;
  role: 'MEMBER' | 'GUEST';
  status: 'ACTIVE' | 'LEFT';
  acceptedAt?: string | null;
  endedAt?: string | null;
}

export type InvitationRole = 'MEMBER' | 'GUEST';

export interface CreateInvitationPayload {
  email: string;
  role: InvitationRole;
}

export interface CreateInvitationResponse {
  id: string;
  homeId: string;
  userId: string;
  role: InvitationRole;
  status: 'PENDING';
  invitedBy: string | null;
  invitedAt: string;
}

export const listHomes = () => apiClient<Home[]>('/homes');
export const getHome = (homeId: string) => apiClient<Home>(`/homes/${encodeURIComponent(homeId)}`);
export const createHome = (payload: { name: string }) =>
  apiClient<Home>('/homes', {
    method: 'POST',
    body: payload,
  });
export const updateHome = (
  homeId: string,
  payload: { name?: string },
) =>
  apiClient<Home>(`/homes/${encodeURIComponent(homeId)}`, { method: 'PATCH', body: payload });

export const deleteHome = (homeId: string) =>
  apiClient<{ deleted: boolean }>(`/homes/${encodeURIComponent(homeId)}`, {
    method: 'DELETE',
  });

export const leaveHome = (homeId: string) =>
  apiClient<HomeMemberMutationResponse>(
    `/homes/${encodeURIComponent(homeId)}/members/me/leave`,
    { method: 'PATCH' },
  );
export const listMembers = (homeId: string) =>
  apiClient<HomeMember[]>(`/homes/${encodeURIComponent(homeId)}/members`);
export const inviteMember = (
  homeId: string,
  payload: CreateInvitationPayload,
) =>
  apiClient<CreateInvitationResponse>(
    `/homes/${encodeURIComponent(homeId)}/invitations`,
    { method: 'POST', body: payload },
  );
export const updateMemberRole = (homeId: string, memberId: string, role: 'MEMBER' | 'GUEST') =>
  apiClient<HomeMemberMutationResponse>(`/homes/${encodeURIComponent(homeId)}/members/${encodeURIComponent(memberId)}/role`, { method: 'PATCH', body: { role } });
export const revokeMember = (homeId: string, memberId: string) =>
  apiClient<HomeMemberMutationResponse>(`/homes/${encodeURIComponent(homeId)}/members/${encodeURIComponent(memberId)}/revoke`, { method: 'PATCH' });
export const listInvitations = () => apiClient<Invitation[]>('/invitations');
export const acceptInvitation = (memberId: string) =>
  apiClient<InvitationActionResponse>(`/invitations/${encodeURIComponent(memberId)}/accept`, { method: 'PATCH' });
export const rejectInvitation = (memberId: string) =>
  apiClient<InvitationActionResponse>(`/invitations/${encodeURIComponent(memberId)}/reject`, { method: 'PATCH' });

export interface HomeMemberPermissions {
  canViewDevices: boolean;
  canViewConsumption: boolean;
  canControlDevices: boolean;
}

export interface DevicePermissionOverrides {
  canViewDevice: boolean | null;
  canViewConsumption: boolean | null;
  canControlDevice: boolean | null;
}

export type UpdateDevicePermissionOverrides = Partial<DevicePermissionOverrides>;

const memberPermissionsPath = (homeId: string, memberId: string) =>
  `/homes/${encodeURIComponent(homeId)}/members/${encodeURIComponent(memberId)}/permissions`;

export const getHomeMemberPermissions = (homeId: string, memberId: string) =>
  apiClient<HomeMemberPermissions>(memberPermissionsPath(homeId, memberId));

export const updateHomeMemberPermissions = (
  homeId: string,
  memberId: string,
  permissions: HomeMemberPermissions,
) =>
  apiClient<HomeMemberPermissions>(memberPermissionsPath(homeId, memberId), {
    method: 'PUT',
    body: permissions,
  });

const devicePermissionsPath = (homeId: string, memberId: string, deviceId: string) =>
  `${memberPermissionsPath(homeId, memberId).replace(/\/permissions$/, '')}/devices/${encodeURIComponent(deviceId)}/permissions`;

export const getMemberDevicePermissions = (
  homeId: string,
  memberId: string,
  deviceId: string,
) =>
  apiClient<DevicePermissionOverrides>(devicePermissionsPath(homeId, memberId, deviceId));

export const updateMemberDevicePermissions = (
  homeId: string,
  memberId: string,
  deviceId: string,
  permissions: UpdateDevicePermissionOverrides,
) =>
  apiClient<DevicePermissionOverrides>(devicePermissionsPath(homeId, memberId, deviceId), {
    method: 'PUT',
    body: permissions,
  });
