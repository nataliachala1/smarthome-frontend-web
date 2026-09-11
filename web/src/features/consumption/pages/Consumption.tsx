import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  getHomeConsumptionSummary,
  getHomeDailyConsumption,
  getDeviceConsumptionSummary,
  listHomeConsumption,
  type ConsumptionReading,
  type DeviceConsumptionSummary,
  type HomeConsumptionSummary,
  type HomeDailyConsumption,
} from '../../../shared/api/consumption.api';

import {
  listDevices,
  type Device,
} from '../../../shared/api/devices.api';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import {
  getHome,
  type Home,
} from '../../../shared/api/homes.api';

import {
  Card,
  CardContent,
} from '../../../components/ui/Card';

type ConsumptionPeriod = 'day' | 'month' | 'year';

interface DateRange {
  from: string;
  to: string;
}

interface DeviceConsumptionCard {
  device: Device;
  todayConsumption: DeviceConsumptionSummary | null;
}

const getStartOfDay = (date: Date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
};

const getEndOfDay = (date: Date) => {
  const result = new Date(date);

  result.setHours(23, 59, 59, 999);

  return result;
};

const getTodayRange = () => {
  const now = new Date();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
};

const getDateRange = (
  period: ConsumptionPeriod,
  selectedDate: Date,
): DateRange => {
  if (period === 'day') {
    return {
      from: getStartOfDay(selectedDate).toISOString(),
      to: getEndOfDay(selectedDate).toISOString(),
    };
  }

  if (period === 'month') {
    const start = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
    );

    const end = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    return {
      from: start.toISOString(),
      to: end.toISOString(),
    };
  }

  const start = new Date(
    selectedDate.getFullYear(),
    0,
    1,
  );

  const end = new Date(
    selectedDate.getFullYear(),
    11,
    31,
    23,
    59,
    59,
    999,
  );

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
};

const formatSelectedDate = (
  period: ConsumptionPeriod,
  date: Date,
) => {
  if (period === 'day') {
    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  if (period === 'month') {
    return new Intl.DateTimeFormat('es-CO', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  return String(date.getFullYear());
};

const moveDate = (
  date: Date,
  period: ConsumptionPeriod,
  amount: number,
) => {
  const result = new Date(date);

  if (period === 'day') {
    result.setDate(result.getDate() + amount);
  }

  if (period === 'month') {
    result.setMonth(result.getMonth() + amount);
  }

  if (period === 'year') {
    result.setFullYear(result.getFullYear() + amount);
  }

  return result;
};

const getConsumptionTitle = (
  period: ConsumptionPeriod,
) => {
  if (period === 'day') {
    return 'Consumo de hoy';
  }

  if (period === 'month') {
    return 'Consumo del mes';
  }

  return 'Consumo del año';
};

export const Consumption = () => {
  const navigate = useNavigate();

  const { homeId } = useParams<{
    homeId: string;
  }>();

  const [home, setHome] = useState<Home | null>(null);

  const [period, setPeriod] =
    useState<ConsumptionPeriod>('day');

  const [selectedDate, setSelectedDate] =
    useState(() => new Date());

  const [summary, setSummary] =
    useState<HomeConsumptionSummary | null>(null);

  const [dailyData, setDailyData] =
    useState<HomeDailyConsumption[]>([]);

  const [readings, setReadings] =
    useState<ConsumptionReading[]>([]);

  const [deviceConsumptionCards, setDeviceConsumptionCards] =
    useState<DeviceConsumptionCard[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const dateRange = useMemo(
    () => getDateRange(period, selectedDate),
    [period, selectedDate],
  );

  const loadConsumption = useCallback(async () => {
    if (!homeId) {
      setError('No se encontró el hogar seleccionado.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const [
        homeResponse,
        summaryResponse,
        dailyResponse,
        readingsResponse,
      ] = await Promise.all([
        getHome(homeId),

        getHomeConsumptionSummary(homeId, {
          from: dateRange.from,
          to: dateRange.to,
        }),

        getHomeDailyConsumption(homeId, {
          from: dateRange.from,
          to: dateRange.to,
        }),

        listHomeConsumption(homeId, {
          from: dateRange.from,
          to: dateRange.to,
          limit: 200,
        }),
      ]);

      const devicesResponse = await listDevices(homeId);

      const todayRange = getTodayRange();

      const deviceCards = await Promise.all(
        devicesResponse.map(async (device) => {
          try {
            const todayConsumption =
              await getDeviceConsumptionSummary(
                homeId,
                device.id,
                {
                  from: todayRange.from,
                  to: todayRange.to,
                },
              );

            return {
              device,
              todayConsumption,
            };
          } catch {
            return {
              device,
              todayConsumption: null,
            };
          }
        }),
      );

      setHome(homeResponse);
      setSummary(summaryResponse);
      setDailyData(dailyResponse);
      setReadings(readingsResponse);
      setDeviceConsumptionCards(deviceCards);

      localStorage.setItem(
        'activeHomeId',
        homeId,
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible cargar el consumo.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [homeId, dateRange.from, dateRange.to]);

  useEffect(() => {
    void loadConsumption();
  }, [loadConsumption]);

  const handlePeriodChange = (
    newPeriod: ConsumptionPeriod,
  ) => {
    setPeriod(newPeriod);

    /*
     * Al cambiar de periodo volvemos al periodo actual.
     *
     * HOY -> hoy
     * MES -> mes actual
     * AÑO -> año actual
     */
    setSelectedDate(new Date());
  };

  const previousPeriod = () => {
    setSelectedDate((current) =>
      moveDate(current, period, -1),
    );
  };

  const nextPeriod = () => {
    setSelectedDate((current) =>
      moveDate(current, period, 1),
    );
  };

  const todayChartData = useMemo(() => {
    return [...readings]
      .reverse()
      .map((reading) => ({
        label: new Intl.DateTimeFormat('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(reading.readAt)),

        energy: reading.energyDeltaKwh,
        power: reading.powerW,
      }));
  }, [readings]);

  const monthChartData = useMemo(() => {
    return dailyData.map((item) => ({
      label: new Date(item.periodStart).getDate().toString(),
      energy: item.totalEnergyDeltaKwh,
    }));
  }, [dailyData]);

  const yearChartData = useMemo(() => {
    const months = Array.from(
      { length: 12 },
      (_, index) => ({
        month: index,
        energy: 0,
      }),
    );

    dailyData.forEach((item) => {
      const date = new Date(item.periodStart);
      const monthIndex = date.getMonth();

      months[monthIndex].energy +=
        item.totalEnergyDeltaKwh;
    });

    return months.map((item) => ({
      label: new Intl.DateTimeFormat('es-CO', {
        month: 'short',
      }).format(
        new Date(
          selectedDate.getFullYear(),
          item.month,
          1,
        ),
      ),

      energy: Number(
        item.energy.toFixed(4),
      ),
    }));
  }, [dailyData, selectedDate]);

  if (isLoading && !summary) {
    return (
      <main className="p-6">
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
          Cargando consumo...
        </div>
      </main>
    );
  }

  if (error && !summary) {
    return (
      <main className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/homes/${homeId}/dashboard`,
              )
            }
            className="mt-3 font-semibold underline"
          >
            Volver al hogar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fe] p-6 dark:bg-[#0f111a]">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* ENCABEZADO */}

        <header>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/homes/${homeId}/dashboard`,
              )
            }
            className="mb-3 text-sm font-semibold text-[#1866C1] hover:underline"
          >
            ← Volver al hogar
          </button>

          <h1 className="text-3xl font-bold text-[#1b254b] dark:text-white">
            Consumo
            {home ? ` — ${home.name}` : ''}
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitorea el consumo energético de tu hogar.
          </p>
        </header>

        {/* SELECTOR HOY / MES / AÑO */}

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-[#151824]">

          <div className="flex flex-col gap-5">

            <div className="flex w-fit rounded-xl bg-gray-100 p-1 dark:bg-gray-800">

              <button
                type="button"
                onClick={() =>
                  handlePeriodChange('day')
                }
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                  period === 'day'
                    ? 'bg-white text-[#1866C1] shadow-sm dark:bg-[#1f2335] dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
                }`}
              >
                Hoy
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePeriodChange('month')
                }
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                  period === 'month'
                    ? 'bg-white text-[#1866C1] shadow-sm dark:bg-[#1f2335] dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
                }`}
              >
                Mes
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePeriodChange('year')
                }
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                  period === 'year'
                    ? 'bg-white text-[#1866C1] shadow-sm dark:bg-[#1f2335] dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
                }`}
              >
                Año
              </button>

            </div>

            {/* NAVEGACIÓN ENTRE PERIODOS */}

            <div className="flex items-center justify-between gap-4 sm:justify-center">

              <button
                type="button"
                onClick={previousPeriod}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-[#151824] dark:text-gray-300"
                aria-label="Periodo anterior"
              >
                ←
              </button>

              <p className="min-w-52 text-center text-sm font-semibold capitalize text-[#1b254b] dark:text-white">
                {formatSelectedDate(
                  period,
                  selectedDate,
                )}
              </p>

              <button
                type="button"
                onClick={nextPeriod}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-[#151824] dark:text-gray-300"
                aria-label="Periodo siguiente"
              >
                →
              </button>

            </div>

          </div>

        </section>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300"
          >
            {error}
          </div>
        )}

        {/* CONSUMO PRINCIPAL */}

        <Card className="rounded-3xl border border-gray-100 dark:border-gray-800">
          <CardContent className="p-7">

            <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              {getConsumptionTitle(period)}
            </p>

            <div className="mt-3 flex items-end gap-2">

              <p className="text-4xl font-bold text-[#1b254b] dark:text-white sm:text-5xl">
                {summary?.totalEnergyDeltaKwh.toFixed(
                  4,
                ) ?? '0.0000'}
              </p>

              <span className="mb-1 text-lg font-semibold text-gray-400">
                kWh
              </span>

            </div>

            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Energía consumida durante el periodo seleccionado.
            </p>

          </CardContent>
        </Card>

        {/* MÉTRICAS */}

        <section className="grid gap-4 sm:grid-cols-3">

          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <CardContent className="p-5">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Potencia promedio
              </p>

              <p className="mt-2 text-3xl font-bold text-[#1b254b] dark:text-white">
                {summary?.averagePowerW !== null &&
                summary?.averagePowerW !== undefined
                  ? summary.averagePowerW.toFixed(2)
                  : '0.00'}{' '}
                W
              </p>

            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <CardContent className="p-5">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Potencia máxima
              </p>

              <p className="mt-2 text-3xl font-bold text-[#1b254b] dark:text-white">
                {summary?.maxPowerW !== null &&
                summary?.maxPowerW !== undefined
                  ? summary.maxPowerW.toFixed(2)
                  : '0.00'}{' '}
                W
              </p>

            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <CardContent className="p-5">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dispositivos con lecturas
              </p>

              <p className="mt-2 text-3xl font-bold text-[#1b254b] dark:text-white">
                {summary?.devicesWithReadings ?? 0}
              </p>

            </CardContent>
          </Card>

        </section>

        {/* ESPACIO PARA LA GRÁFICA */}

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#151824]">

          <h2 className="text-xl font-bold text-[#1b254b] dark:text-white">
            {period === 'day'
              ? 'Consumo de hoy'
              : period === 'month'
                ? 'Consumo por día'
                : 'Consumo por mes'}
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Aquí mostraremos la gráfica de consumo.
          </p>

          <div className="mt-6 h-80">
            {period === 'day' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={todayChartData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="label"
                    minTickGap={25}
                  />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="power"
                    name="Potencia"
                    unit=" W"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {period === 'month' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthChartData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="label"
                  />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="energy"
                    name="Consumo"
                    unit=" kWh"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}

            {period === 'year' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearChartData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="label"
                  />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="energy"
                    name="Consumo"
                    unit=" kWh"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </section>

        {/* ESPACIO PARA DISPOSITIVOS */}

        <section>

          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#1b254b] dark:text-white">
              Dispositivos del hogar
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Potencia actual y consumo acumulado de hoy.
            </p>
          </div>

          {deviceConsumptionCards.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
              Este hogar no tiene dispositivos con información de consumo.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {deviceConsumptionCards.map(
                ({ device, todayConsumption }) => (
                  <Card
                    key={device.id}
                    className="rounded-2xl border border-gray-100 dark:border-gray-800"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-[#1b254b] dark:text-white">
                            {device.name}
                          </h3>

                          <span
                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                              device.connectivityStatus === 'ONLINE'
                                ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {device.connectivityStatus}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Potencia actual
                          </p>

                          <p className="mt-2 text-2xl font-bold text-[#1b254b] dark:text-white">
                            {device.currentPowerW ?? 0} W
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Consumo de hoy
                          </p>

                          <p className="mt-2 text-2xl font-bold text-[#1b254b] dark:text-white">
                            {todayConsumption
                              ? todayConsumption.totalEnergyDeltaKwh.toFixed(4)
                              : '0.0000'}{' '}
                            kWh
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          )}

        </section>

      </div>
    </main>
  );
};

export default Consumption;