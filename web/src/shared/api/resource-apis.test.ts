import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./api-client', () => ({ apiClient: vi.fn(() => Promise.resolve('ok')) }));

import { apiClient } from './api-client';
import * as devices from './devices.api';
import * as homes from './homes.api';
import * as notifications from './notifications.api';

const client = vi.mocked(apiClient);

describe('resource API modules', () => {
  beforeEach(() => client.mockClear());

  it('builds encoded device routes and control commands', async () => {
    await devices.listDevices('home 1');
    await devices.listInactiveDevices('h1');
    await devices.getDevice('h1', 'd/1');
    await devices.createDevice('h1', { name: 'Lámpara' });
    await devices.updateDevice('h1', 'd1', { name: 'Sala' });
    await devices.activateDevice('h1', 'd1');
    await devices.deactivateDevice('h1', 'd1');
    await devices.controlDevice('h1', 'd1', 'TURN_ON');
    await devices.deleteDevice('h1', 'd1');

    expect(client.mock.calls).toEqual([
      ['/homes/home%201/devices'],
      ['/homes/h1/devices/inactive'],
      ['/homes/h1/devices/d%2F1'],
      ['/homes/h1/devices', { method: 'POST', body: { name: 'Lámpara' } }],
      ['/homes/h1/devices/d1', { method: 'PATCH', body: { name: 'Sala' } }],
      ['/homes/h1/devices/d1/activate', { method: 'PATCH' }],
      ['/homes/h1/devices/d1/deactivate', { method: 'PATCH' }],
      ['/homes/h1/devices/d1/control', { method: 'PATCH', body: { command: 'TURN_ON' } }],
      ['/homes/h1/devices/d1', { method: 'DELETE' }],
    ]);
  });

  it('exposes home and notification endpoints that call the API client', async () => {
    const calls: Array<() => Promise<unknown>> = [];
    for (const module of [homes, notifications]) {
      for (const [name, fn] of Object.entries(module)) {
        if (typeof fn !== 'function') continue;
        calls.push(() => (fn as (...args: string[]) => Promise<unknown>)('h1', 'm1', 'x'));
        expect(name).toMatch(/^[a-z][A-Za-z]+$/);
      }
    }
    for (const call of calls) await expect(call()).resolves.toBe('ok');
    expect(client).toHaveBeenCalledTimes(calls.length);
    for (const [path] of client.mock.calls) expect(path).toMatch(/^\/(homes|invitations|notifications)/);
  });
});
