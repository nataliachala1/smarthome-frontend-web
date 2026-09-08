import { apiClient } from './api-client';

export interface Device {
  id: string;
  homeId: string;
  deviceTypeId: string;
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

export interface DeviceType {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export const listDevices = (homeId: string) =>
  apiClient<Device[]>(`/homes/${encodeURIComponent(homeId)}/devices`);
export const createDevice = (homeId: string, payload: {
  deviceTypeId: string;
  name: string;
  manufacturerDeviceId?: string;
  transportType?: 'WIFI' | 'BLUETOOTH';
  messagingProtocol?: 'MQTT';
}) => apiClient<Device>(`/homes/${encodeURIComponent(homeId)}/devices`, { method: 'POST', body: payload });
export const listDeviceTypes = () => apiClient<DeviceType[]>('/device-types');
