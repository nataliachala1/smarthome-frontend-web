import { apiClient } from './api-client';

export interface HomeConsumptionSummary {
  homeId: string;
  from: string | null;
  to: string | null;
  readingsCount: number;
  devicesWithReadings: number;
  totalEnergyDeltaKwh: number;
  averagePowerW: number | null;
  maxPowerW: number | null;
  minPowerW: number | null;
  latestReadAt: string | null;
}

export interface HomeDailyConsumption {
  homeId: string;
  periodStart: string;
  readingsCount: number;
  totalEnergyDeltaKwh: number;
  averagePowerW: number | null;
  maxPowerW: number | null;
  minPowerW: number | null;
}

export interface ConsumptionReading {
  id: string;
  homeId: string;
  deviceId: string;
  deviceName: string;
  manufacturerDeviceId: string | null;
  powerW: number;
  energyDeltaKwh: number;
  energyTotalKwh: number | null;
  voltageV: number | null;
  currentA: number | null;
  frequencyHz: number | null;
  temperatureC: number | null;
  readAt: string;
}

export interface DeviceConsumptionSummary {
  homeId: string;
  deviceId: string;
  from: string | null;
  to: string | null;
  readingsCount: number;
  totalEnergyDeltaKwh: number;
  latestEnergyTotalKwh: number | null;
  averagePowerW: number | null;
  maxPowerW: number | null;
  minPowerW: number | null;
  latestReadAt: string | null;
}

interface ConsumptionQuery {
  from?: string;
  to?: string;
  limit?: number;
}

const buildQueryString = ({
  from,
  to,
  limit,
}: ConsumptionQuery) => {
  const params = new URLSearchParams();

  if (from) {
    params.set('from', from);
  }

  if (to) {
    params.set('to', to);
  }

  if (limit !== undefined) {
    params.set('limit', String(limit));
  }

  const query = params.toString();

  return query ? `?${query}` : '';
};

export const getHomeConsumptionSummary = (
  homeId: string,
  query: Omit<ConsumptionQuery, 'limit'> = {},
) =>
  apiClient<HomeConsumptionSummary>(
    `/homes/${encodeURIComponent(homeId)}/consumption/summary${buildQueryString(
      query,
    )}`,
  );

export const getHomeDailyConsumption = (
  homeId: string,
  query: Omit<ConsumptionQuery, 'limit'> = {},
) =>
  apiClient<HomeDailyConsumption[]>(
    `/homes/${encodeURIComponent(homeId)}/consumption/daily${buildQueryString(
      query,
    )}`,
  );

export const listHomeConsumption = (
  homeId: string,
  query: ConsumptionQuery = {},
) =>
  apiClient<ConsumptionReading[]>(
    `/homes/${encodeURIComponent(homeId)}/consumption${buildQueryString(
      query,
    )}`,
  );

export const getDeviceConsumptionSummary = (
  homeId: string,
  deviceId: string,
  query: Omit<ConsumptionQuery, 'limit'> = {},
) =>
  apiClient<DeviceConsumptionSummary>(
    `/homes/${encodeURIComponent(
      homeId,
    )}/devices/${encodeURIComponent(
      deviceId,
    )}/consumption/summary${buildQueryString(query)}`,
  );