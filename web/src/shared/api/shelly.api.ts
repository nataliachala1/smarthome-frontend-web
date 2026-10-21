import { apiClient } from './api-client';
import { buildShellyPairingSessionPath, buildShellySetupCapabilitiesPath } from './shelly-pairing-contract';

import type {
  Device,
} from './devices.api';

export interface DiscoveredShellyDevice {
  ip: string;
  hostname: string;
  port: number;
  manufacturerDeviceId: string;
  mac: string;
  model: string;
  modelCode: string;
  generation: number;
  firmwareVersion: string | null;
}

export interface IdentifiedShellyDevice {
  manufacturerDeviceId: string;
  model: string;
  modelCode: string;
  mac: string;
  wifiIp: string;
  firmwareVersion: string | null;
  mqttConnected: boolean | null;
  authenticationRequired: boolean;
  message: string;
}

export interface ProvisionShellyPayload {
  shellyIp: string;
  name: string;
}

export interface ProvisionShellyResponse {
  message: string;

  device: Device;

  shelly: {
    ip: string;

    manufacturerDeviceId:
      string;

    mac: string;

    model: string;

    modelCode: string;

    firmwareVersion:
      string | null;
  };

  mqtt: {
    server: string;

    topicPrefix: string;

    connected: boolean;
  };
}

export const discoverShellyDevices = (
  homeId: string,
) =>
  apiClient<
    DiscoveredShellyDevice[]
  >(
    `/homes/${encodeURIComponent(
      homeId,
    )}/shelly/discover`,
  );

export const identifyShellyDevice = (
  homeId: string,
  shellyIp: string,
) =>
  apiClient<
    IdentifiedShellyDevice
  >(
    `/homes/${encodeURIComponent(
      homeId,
    )}/shelly/identify`,
    {
      method: 'POST',

      body: {
        shellyIp,
      },
    },
  );

export const provisionShellyDevice = (
  homeId: string,
  payload: ProvisionShellyPayload,
) =>
  apiClient<ProvisionShellyResponse>(
    `/homes/${encodeURIComponent(homeId)}/shelly/provision`,
    {
      method: 'POST',
      body: payload,
    },
  );

export type ShellyPairingStatus = 'PENDING' | 'DEVICE_IDENTIFIED' | 'WAITING_FOR_MQTT' | 'CONNECTED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'FAILED';
export interface ShellySetupCapabilities { preferredMethod: 'AP' | 'BLE'; compatibleModels: Array<{ modelCode: string; generation: number; firmwareCompatibility: string }>; methods: { AP: { sessionCoordination: string; deviceConfiguration: string; physicalValidation: string; localRpcBaseUrl: string }; BLE: { sessionCoordination: string; reason?: string } }; brokerCredentialProvisioning: { status: string; reason: string }; pairingCompletion: string; completionRequires: string }
export interface ShellyPairingSession { sessionId: string; homeId: string; method: 'AP' | 'BLE'; status: ShellyPairingStatus; expiresAt: string; identity: { manufacturerDeviceId: string; modelCode: string; generation: number; firmwareVersion: string | null; reportedAt: string; verification: string } | null; completion: { deviceId?: string; ready?: boolean; code?: string; message?: string } | null; failureCode: string | null }
export interface CreateShellyPairingSessionPayload { requestId: string; sessionToken: string; method: 'AP' | 'BLE' }
export interface ReportShellyPairingIdentityPayload { manufacturerDeviceId: string; modelCode: string; generation: number; firmwareVersion?: string }
const pairingPath = buildShellyPairingSessionPath;
export const getShellySetupCapabilities = (homeId: string) => apiClient<ShellySetupCapabilities>(buildShellySetupCapabilitiesPath(homeId));
export const createShellyPairingSession = (homeId: string, payload: CreateShellyPairingSessionPayload) => apiClient<ShellyPairingSession>(pairingPath(homeId), { method: 'POST', body: payload });
export const getShellyPairingSession = (homeId: string, sessionId: string, sessionToken: string) => apiClient<ShellyPairingSession>(pairingPath(homeId, sessionId), { headers: { 'X-Pairing-Token': sessionToken } });
export const reportShellyPairingIdentity = (homeId: string, sessionId: string, sessionToken: string, payload: ReportShellyPairingIdentityPayload) => apiClient<ShellyPairingSession>(pairingPath(homeId, sessionId) + '/identify', { method: 'POST', headers: { 'X-Pairing-Token': sessionToken }, body: payload });
export const cancelShellyPairingSession = (homeId: string, sessionId: string, sessionToken: string) => apiClient<ShellyPairingSession>(pairingPath(homeId, sessionId), { method: 'DELETE', headers: { 'X-Pairing-Token': sessionToken } });
export interface CompleteShellyPairingResponse extends ShellyPairingSession { completion: { deviceId?: string; ready: boolean; code?: string; message?: string } | null; device?: Device }
export const completeShellyPairingSession = (homeId: string, sessionId: string, sessionToken: string, name: string) => apiClient<CompleteShellyPairingResponse>(pairingPath(homeId, sessionId) + '/complete', { method: 'POST', headers: { 'X-Pairing-Token': sessionToken }, body: { name } });
