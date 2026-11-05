import type { ShellyPairingMethod } from './shelly.api';

export const createShellyPairingCredentials = (method: ShellyPairingMethod = 'AP') => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const sessionToken = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return { requestId: crypto.randomUUID(), sessionToken, method };
};
export const buildShellyPairingSessionPath = (homeId: string, sessionId?: string) =>
  '/homes/' + encodeURIComponent(homeId) + '/shelly/setup-sessions' + (sessionId ? '/' + encodeURIComponent(sessionId) : '');
export const buildShellySetupCapabilitiesPath = (homeId: string) =>
  '/homes/' + encodeURIComponent(homeId) + '/shelly/setup-capabilities';
