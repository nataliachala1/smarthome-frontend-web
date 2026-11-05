import test from 'node:test';
import assert from 'node:assert/strict';
import { buildShellyPairingSessionPath, buildShellySetupCapabilitiesPath, createShellyPairingCredentials } from '../src/shared/api/shelly-pairing-contract.ts';
test('setup routes encode home and session ids as one path segment', () => {
  assert.equal(buildShellySetupCapabilitiesPath('home/uno'), '/homes/home%2Funo/shelly/setup-capabilities');
  assert.equal(buildShellyPairingSessionPath('home uno'), '/homes/home%20uno/shelly/setup-sessions');
  assert.equal(buildShellyPairingSessionPath('home', 'session/one'), '/homes/home/shelly/setup-sessions/session%2Fone');
});
test('pairing credentials meet API validation and are independently generated', () => {
  const first = createShellyPairingCredentials(); const second = createShellyPairingCredentials();
  assert.match(first.requestId, /^[0-9a-f-]{36}$/i); assert.match(first.sessionToken, /^[A-Za-z0-9_-]{43,128}$/);
  assert.equal(first.method, 'AP'); assert.notEqual(first.sessionToken, second.sessionToken); assert.notEqual(first.requestId, second.requestId);
});