import { getApiBaseUrl } from './api-client';
import { ApiError } from './errors';

export interface ShellyMqttOperationRequest {
  operationId: string;
  localConfigurationReadbackVerified?: boolean;
}

export interface ShellyMqttOperationOptions {
  homeId: string;
  sessionId: string;
  pairingToken: string;
  operationId: string;
  labNetworkApproval?: 'isolated-dev-lan-only';
}

const parseResponse = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') || '';

  if (response.status === 204) return null;
  if (contentType.includes('application/json')) return response.json();

  const body = await response.text();
  return body || null;
};

/**
 * MQTT setup actions can have uncertain outcomes. Send each operation once;
 * poll the setup session and reconcile before trying again.
 */
const postShellyMqttOperation = async <T>(
  options: ShellyMqttOperationOptions,
  action: 'prepare' | 'bootstrap' | 'enable' | 'confirm',
  body?: ShellyMqttOperationRequest,
): Promise<T> => {
  const token = localStorage.getItem('token');
  const headers = new Headers({
    Accept: 'application/json',
    'X-Pairing-Token': options.pairingToken,
  });

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (body) headers.set('Content-Type', 'application/json');
  if (options.labNetworkApproval) {
    headers.set('X-SmartHome-Lab-Network-Approval', options.labNetworkApproval);
  }

  const path =
    `/homes/${encodeURIComponent(options.homeId)}` +
    `/shelly/setup-sessions/${encodeURIComponent(options.sessionId)}` +
    `/mqtt/${action}`;
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : `Solicitud fallida (${response.status})`;

    throw new ApiError(message, {
      status: response.status,
      details: payload,
    });
  }

  return payload as T;
};

export const prepareShellyMqtt = <T = unknown>(
  options: ShellyMqttOperationOptions,
) => postShellyMqttOperation<T>(options, 'prepare');

export const bootstrapShellyMqtt = <T = unknown>(
  options: ShellyMqttOperationOptions,
) =>
  postShellyMqttOperation<T>(options, 'bootstrap', {
    operationId: options.operationId,
  });

export const enableShellyMqtt = <T = unknown>(
  options: ShellyMqttOperationOptions,
  localConfigurationReadbackVerified = false,
) =>
  postShellyMqttOperation<T>(options, 'enable', {
    operationId: options.operationId,
    localConfigurationReadbackVerified,
  });

export const confirmShellyMqttAuthentication = <T = unknown>(
  options: ShellyMqttOperationOptions,
) =>
  postShellyMqttOperation<T>(options, 'confirm', {
    operationId: options.operationId,
  });
