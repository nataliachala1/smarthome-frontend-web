import { apiClient } from './api-client';

export interface Device {
  id: string;
  homeId: string;
  name: string;
  status: string;
  connectivityStatus: string;
  isOn: boolean;
  currentPowerW: number | null;
  manufacturerDeviceId: string | null;
  transportType: 'WIFI' | 'BLUETOOTH' | null;
  messagingProtocol: 'MQTT' | null;
  createdAt: string;
  updatedAt: string;
}

export const listDevices = (homeId: string) =>
  apiClient<Device[]>(
    `/homes/${encodeURIComponent(homeId)}/devices`,
  );

export const createDevice = (
  homeId: string,
  payload: {
    name: string;
    manufacturerDeviceId?: string;
    transportType?: 'WIFI' | 'BLUETOOTH';
    messagingProtocol?: 'MQTT';
  },
) =>
  apiClient<Device>(
    `/homes/${encodeURIComponent(homeId)}/devices`,
    {
      method: 'POST',
      body: payload,
    },
  );

export const getDevice = (
  homeId: string,
  deviceId: string,
) =>
  apiClient<Device>(
    `/homes/${encodeURIComponent(homeId)}/devices/${encodeURIComponent(deviceId)}`,
  );

export const updateDevice = (
  homeId: string,
  deviceId: string,
  payload: {
    name?: string;
    transportType?: 'WIFI' | 'BLUETOOTH';
    messagingProtocol?: 'MQTT';
  },
) =>
  apiClient<Device>(
    `/homes/${encodeURIComponent(homeId)}/devices/${encodeURIComponent(deviceId)}`,
    {
      method: 'PATCH',
      body: payload,
    },
  );

export const deactivateDevice = (
  homeId: string,
  deviceId: string,
) =>
  apiClient<Device>(
    `/homes/${encodeURIComponent(homeId)}/devices/${encodeURIComponent(deviceId)}/deactivate`,
    {
      method: 'PATCH',
    },
  );

export interface ControlDeviceResponse {
  id: string;
  homeId: string;
  command: 'TURN_ON' | 'TURN_OFF';
  status: 'COMMAND_PUBLISHED';
  previousIsOn: boolean;
  connectivityStatus: 'ONLINE' | 'OFFLINE';
}

export const controlDevice = (
  homeId: string,
  deviceId: string,
  command: 'TURN_ON' | 'TURN_OFF',
) =>
  apiClient<ControlDeviceResponse>(
    `/homes/${encodeURIComponent(homeId)}/devices/${encodeURIComponent(deviceId)}/control`,
    {
      method: 'PATCH',
      body: { command },
    },
  );

export interface DeleteDeviceResponse {
  message: string;
}

export const listInactiveDevices = (homeId: string) =>
  apiClient<Device[]>(
    `/homes/${encodeURIComponent(homeId)}/devices/inactive`,
  );

export const activateDevice = (homeId: string, deviceId: string) =>
  apiClient<Device>(
    `/homes/${encodeURIComponent(homeId)}/devices/${encodeURIComponent(deviceId)}/activate`,
    { method: 'PATCH' },
  );

export const deleteDevice = (homeId: string, deviceId: string) =>
  apiClient<DeleteDeviceResponse>(
    `/homes/${encodeURIComponent(homeId)}/devices/${encodeURIComponent(deviceId)}`,
    { method: 'DELETE' },
  );
