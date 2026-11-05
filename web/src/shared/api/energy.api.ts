import { apiClient } from './api-client';

export interface HomeEnergyTariff {
  id: string;
  homeId: string;
  unitPriceCopKwh: string;
  effectiveFrom: string;
  createdAt: string;
}

export interface HomeEnergyTariffList {
  homeId: string;
  tariffs: HomeEnergyTariff[];
}

export interface CurrentHomeEnergyTariff {
  homeId: string;
  at: string;
  tariff: HomeEnergyTariff | null;
}

export interface HomeEnergyGoal {
  id: string;
  homeId: string;
  month: string;
  monthlyBudgetCop: string | null;
  targetKwh: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonthHomeEnergyGoal {
  homeId: string;
  month: string;
  goal: HomeEnergyGoal | null;
}

export interface HomeEnergySummary {
  homeId: string;
  month: string;
  timezone: string;
  from: string;
  to: string;
  readingsCount: number;
  unpricedReadings: number;
  totalKwh: string;
  costComplete: boolean;
  estimatedCostCop: string | null;
  partialCostCop: string;
  monthlyBudgetCop: string | null;
  targetKwh: string | null;
  budgetUsagePercent: string | null;
  targetUsagePercent: string | null;
  currency: 'COP';
}

const homeEnergyPath = (homeId: string) =>
  `/homes/${encodeURIComponent(homeId)}/energy`;

const monthQuery = (month: string) =>
  `?${new URLSearchParams({ month }).toString()}`;

export const listHomeEnergyTariffs = (homeId: string) =>
  apiClient<HomeEnergyTariffList>(`${homeEnergyPath(homeId)}/tariffs`);

export const getCurrentHomeEnergyTariff = (homeId: string, at: string) =>
  apiClient<CurrentHomeEnergyTariff>(
    `${homeEnergyPath(homeId)}/tariffs/current?${new URLSearchParams({ at }).toString()}`,
  );

export const createHomeEnergyTariff = (
  homeId: string,
  payload: { unitPriceCopKwh: string; effectiveFrom: string },
) =>
  apiClient<HomeEnergyTariff>(`${homeEnergyPath(homeId)}/tariffs`, {
    method: 'POST',
    body: payload,
  });

export const getHomeEnergyGoal = (homeId: string, month: string) =>
  apiClient<MonthHomeEnergyGoal>(
    `${homeEnergyPath(homeId)}/goals${monthQuery(month)}`,
  );

export const upsertHomeEnergyGoal = (
  homeId: string,
  month: string,
  payload: { monthlyBudgetCop: string | null; targetKwh: string | null },
) =>
  apiClient<HomeEnergyGoal>(
    `${homeEnergyPath(homeId)}/goals/${encodeURIComponent(month)}`,
    { method: 'PUT', body: payload },
  );

export const getHomeEnergySummary = (homeId: string, month: string) =>
  apiClient<HomeEnergySummary>(
    `${homeEnergyPath(homeId)}/summary${monthQuery(month)}`,
  );
