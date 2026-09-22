import { apiClient } from './api-client';

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
  apiClient<
    ProvisionShellyResponse
  >(
    `/homes/${encodeURIComponent(
      homeId,
    )}/shelly/provision`,
    {
      method: 'POST',

      body:
        payload,
    },
  );