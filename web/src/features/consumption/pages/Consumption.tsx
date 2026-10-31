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
  listMembers,
  type Home,
} from '../../../shared/api/homes.api';
import { useAuth } from '../../../app/contexts/AuthContext';

import {
  Card,
  CardContent,
} from '../../../components/ui/Card';

import {
  getRealtimeSocket,
} from '../../../shared/realtime/realtime-client';

type ConsumptionPeriod = 'day' | 'month' | 'year';

interface DateRange {
  from: string;
  to: string;
}

interface DeviceConsumptionCard {
  device: Device;
  todayConsumption: DeviceConsumptionSummary | null;
  errorMessage: string | null;
}

const chartTickStyle = {
  fill: 'var(--muted-foreground)',
  fontSize: 12,
};

const chartTooltipContentStyle = {
  borderRadius: 12,
  borderColor: 'var(--border)',
  backgroundColor: 'var(--popover)',
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.14)',
};

const chartTooltipLabelStyle = {
  color: 'var(--popover-foreground)',
  fontWeight: 600,
  marginBottom: 4,
};

const chartTooltipItemStyle = {
  color: 'var(--primary)',
  fontSize: 13,
};

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
  const { user } = useAuth();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const { homeId } = useParams<{
    homeId: string;
  }>();

  const [home, setHome] = useState<Home | null>(null);
  const [isGuest, setIsGuest] = useState(false);

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

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    motionPreference.addEventListener('change', updateMotionPreference);

    return () => {
      motionPreference.removeEventListener('change', updateMotionPreference);
    };
  }, []);

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
    setHome(null);
    setSummary(null);
    setDailyData([]);
    setReadings([]);
    setDeviceConsumptionCards([]);
    setIsGuest(false);

    try {
      const [homeResponse, membersResponse] = await Promise.all([
        getHome(homeId),
        listMembers(homeId),
      ]);

      const membership = membersResponse.find(
        (member) =>
          member.homeId === homeId &&
          member.userId === user?.id &&
          member.status === 'ACTIVE',
      );

      if (!membership) {
        throw new Error('No se pudo verificar tu membresía activa en este hogar.');
      }

      const summaryResponse = await getHomeConsumptionSummary(homeId, {
        from: dateRange.from,
        to: dateRange.to,
      });

      setHome(homeResponse);
      setSummary(summaryResponse);
      setIsGuest(membership.role === 'GUEST');

      localStorage.setItem('activeHomeId', homeId);

      if (membership.role === 'GUEST') {
        setDailyData([]);
        setReadings([]);
        setDeviceConsumptionCards([]);
        return;
      }

      const [
        dailyResponse,
        readingsResponse,
        devicesResponse,
      ] = await Promise.all([
        getHomeDailyConsumption(homeId, {
          from: dateRange.from,
          to: dateRange.to,
        }),
        listHomeConsumption(homeId, {
          from: dateRange.from,
          to: dateRange.to,
          limit: 200,
        }),
        listDevices(homeId),
      ]);

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
              errorMessage: null,
            };
          } catch (cause) {
            return {
              device,
              todayConsumption: null,
              errorMessage:
                cause instanceof Error
                  ? cause.message
                  : 'No fue posible cargar el consumo de este dispositivo.',
            };
          }
        }),
      );

      setDailyData(dailyResponse);
      setReadings(readingsResponse);
      setDeviceConsumptionCards(deviceCards);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible cargar el consumo.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [homeId, dateRange.from, dateRange.to, user?.id]);

  useEffect(() => {
    void loadConsumption();
  }, [loadConsumption]);
    useEffect(() => {
      if (!homeId || isGuest) {
      return;
    }

    const socket = getRealtimeSocket();

    if (!socket) {
      return;
    }

    const handleConsumptionCreated = (
      reading: ConsumptionReading,
    ) => {
      if (reading.homeId !== homeId) {
        return;
      }

      const readAt = new Date(reading.readAt).getTime();
      const from = new Date(dateRange.from).getTime();
      const to = new Date(dateRange.to).getTime();

      if (
        Number.isNaN(readAt) ||
        Number.isNaN(from) ||
        Number.isNaN(to)
      ) {
        return;
      }

      if (readAt < from || readAt > to) {
        return;
      }

      setReadings((currentReadings) => {
        const alreadyExists = currentReadings.some(
          (currentReading) =>
            currentReading.id === reading.id,
        );

        if (alreadyExists) {
          return currentReadings;
        }

        return [...currentReadings, reading].sort(
          (a, b) =>
            new Date(b.readAt).getTime() -
            new Date(a.readAt).getTime(),
        );
      });
    };

    socket.on(
      'consumption.created',
      handleConsumptionCreated,
    );

    return () => {
      socket.off(
        'consumption.created',
        handleConsumptionCreated,
      );
    };
  }, [homeId, dateRange.from, dateRange.to, isGuest]);

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

  const hasChartData =
    period === 'day'
      ? todayChartData.length > 0
      : dailyData.length > 0;

  if (isLoading && !summary) {
    return (
      <div className="sh-page-enter">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-gray-500 shadow-sm shadow-slate-900/5 dark:border-gray-800 dark:bg-[#151824] dark:text-gray-400">
          Cargando consumo...
        </div>
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="sh-page-enter">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700 shadow-sm shadow-red-900/5 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300 sm:p-6">
          <p>{error}</p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={() => void loadConsumption()}
              className="inline-flex min-h-11 items-center rounded-md font-semibold underline underline-offset-4 transition-colors duration-200 hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:hover:text-red-200 dark:focus-visible:ring-offset-gray-950 motion-reduce:transition-none"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/homes/${homeId}/dashboard`,
                )
              }
              className="inline-flex min-h-11 items-center rounded-md font-semibold underline underline-offset-4 transition-colors duration-200 hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:hover:text-red-200 dark:focus-visible:ring-offset-gray-950 motion-reduce:transition-none"
            >
              Volver al hogar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f4f7fe] dark:bg-[#0b1120]">
      <div className="mx-auto max-w-7xl space-y-7 sh-page-enter">

        {/* ENCABEZADO */}

        <header>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/homes/${homeId}/dashboard`,
              )
            }
            className="mb-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#1866C1] transition-colors duration-200 hover:underline underline-offset-4 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1] focus-visible:ring-offset-4 motion-reduce:transition-none"
          >
            ← Volver al hogar
          </button>

          <h1 className="break-words text-2xl font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-3xl">
            Consumo
            {home ? ` — ${home.name}` : ''}
          </h1>

          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Monitorea el consumo energético de tu hogar.
          </p>
        </header>

        {/* SELECTOR HOY / MES / AÑO */}

        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 dark:border-gray-800 dark:bg-[#151824] dark:shadow-black/20 sm:p-5">

          <div className="flex flex-col gap-5">

            <div className="flex w-fit rounded-xl bg-gray-100 p-1 dark:bg-gray-800">

              <button
                type="button"
                onClick={() =>
                  handlePeriodChange('day')
                }
                className={`inline-flex min-h-11 items-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1]/40 focus-visible:ring-offset-1 motion-reduce:transition-none sm:px-5 ${
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
                className={`inline-flex min-h-11 items-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1]/40 focus-visible:ring-offset-1 motion-reduce:transition-none sm:px-5 ${
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
                className={`inline-flex min-h-11 items-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1]/40 focus-visible:ring-offset-1 motion-reduce:transition-none sm:px-5 ${
                  period === 'year'
                    ? 'bg-white text-[#1866C1] shadow-sm dark:bg-[#1f2335] dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
                }`}
              >
                Año
              </button>

            </div>

            {/* NAVEGACIÓN ENTRE PERIODOS */}

            <div className="flex items-center justify-between gap-3 sm:justify-center sm:gap-4">

              <button
                type="button"
                onClick={previousPeriod}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-gray-600 transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1]/40 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-[#151824] dark:text-gray-300 dark:hover:bg-gray-800 motion-reduce:transition-none"
                aria-label="Periodo anterior"
              >
                ←
              </button>

              <p className="min-w-0 flex-1 text-center text-sm font-semibold capitalize text-[#1b254b] dark:text-white sm:min-w-52 sm:flex-none">
                {formatSelectedDate(
                  period,
                  selectedDate,
                )}
              </p>

              <button
                type="button"
                onClick={nextPeriod}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-gray-600 transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1]/40 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-[#151824] dark:text-gray-300 dark:hover:bg-gray-800 motion-reduce:transition-none"
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
            className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 shadow-sm shadow-amber-900/5 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300 sm:p-5"
          >
            {error}
          </div>
        )}

        {/* CONSUMO PRINCIPAL */}

        <Card className="rounded-3xl border border-slate-200/80 shadow-sm shadow-slate-900/5 dark:border-gray-800">
          <CardContent className="p-5 sm:p-7">

            <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              {getConsumptionTitle(period)}
            </p>

            <div className="mt-3 flex items-end gap-2">

              <p className="break-words text-4xl font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-5xl">
                {summary?.readingsCount === 0
                  ? 'Sin datos'
                  : summary
                    ? summary.totalEnergyDeltaKwh.toFixed(4)
                    : 'Sin datos'}
              </p>

              <span className="mb-1 text-lg font-semibold text-gray-400">
                kWh
              </span>

            </div>

            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {summary?.readingsCount === 0
                ? 'No hay lecturas registradas durante el periodo seleccionado.'
                : 'Energía consumida durante el periodo seleccionado.'}
            </p>

          </CardContent>
        </Card>

        {isGuest && (
          <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
            Tu rol de Invitado permite consultar el consumo total del periodo. Las métricas y lecturas detalladas no están disponibles.
          </p>
        )}

        {/* MÉTRICAS */}

        {!isGuest && <section className="grid gap-4 sm:grid-cols-3">

          <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 dark:border-gray-800">
            <CardContent className="p-5 sm:p-6">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Potencia promedio
              </p>

              <p className="mt-2 break-words text-2xl font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-3xl">
                {summary?.averagePowerW !== null &&
                summary?.averagePowerW !== undefined
                  ? summary.averagePowerW.toFixed(2)
                  : 'Sin datos'}{' '}
                W
              </p>

            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 dark:border-gray-800">
            <CardContent className="p-5 sm:p-6">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Potencia máxima
              </p>

              <p className="mt-2 break-words text-2xl font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-3xl">
                {summary?.maxPowerW !== null &&
                summary?.maxPowerW !== undefined
                  ? summary.maxPowerW.toFixed(2)
                  : 'Sin datos'}{' '}
                W
              </p>

            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 dark:border-gray-800">
            <CardContent className="p-5 sm:p-6">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dispositivos con lecturas
              </p>

              <p className="mt-2 break-words text-2xl font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-3xl">
                {summary?.devicesWithReadings ?? 'Sin datos'}
              </p>

            </CardContent>
          </Card>

        </section>}

        {/* ESPACIO PARA LA GRÁFICA */}

        {!isGuest && <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 dark:border-gray-800 dark:bg-[#151824] dark:shadow-black/20 sm:p-6">

          <h2 className="text-lg font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-xl">
            {period === 'day'
              ? 'Consumo de hoy'
              : period === 'month'
                ? 'Consumo por día'
                : 'Consumo por mes'}
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Lecturas registradas durante el periodo seleccionado.
          </p>

          <div className="mt-5 h-64 sm:mt-6 sm:h-80">
            {!hasChartData ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
                No hay lecturas registradas para el periodo seleccionado.
              </div>
            ) : period === 'day' ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={todayChartData}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" strokeOpacity={0.72} />

                  <XAxis
                    dataKey="label"
                    minTickGap={25}
                    tick={chartTickStyle}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                  />

                  <YAxis
                    tick={chartTickStyle}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={chartTooltipContentStyle}
                    labelStyle={chartTooltipLabelStyle}
                    itemStyle={chartTooltipItemStyle}
                  />

                  <Line
                    type="monotone"
                    dataKey="power"
                    name="Potencia"
                    unit=" W"
                    stroke="#1866C1"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, fill: 'var(--card)' }}
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={220}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : period === 'month' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthChartData}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" strokeOpacity={0.72} />

                  <XAxis
                    dataKey="label"
                    minTickGap={10}
                    interval="preserveStartEnd"
                    tick={chartTickStyle}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                  />

                  <YAxis
                    tick={chartTickStyle}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={chartTooltipContentStyle}
                    labelStyle={chartTooltipLabelStyle}
                    itemStyle={chartTooltipItemStyle}
                  />

                  <Bar
                    dataKey="energy"
                    name="Consumo"
                    unit=" kWh"
                    fill="#1866C1"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={36}
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={220}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearChartData}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" strokeOpacity={0.72} />

                  <XAxis
                    dataKey="label"
                    tick={chartTickStyle}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                  />

                  <YAxis
                    tick={chartTickStyle}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={chartTooltipContentStyle}
                    labelStyle={chartTooltipLabelStyle}
                    itemStyle={chartTooltipItemStyle}
                  />

                  <Bar
                    dataKey="energy"
                    name="Consumo"
                    unit=" kWh"
                    fill="#1866C1"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={36}
                    isAnimationActive={!prefersReducedMotion}
                    animationDuration={220}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </section>}

        {/* ESPACIO PARA DISPOSITIVOS */}

        {!isGuest && <section>

          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-xl">
              Dispositivos del hogar
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Potencia actual y consumo acumulado de hoy.
            </p>
          </div>

          {deviceConsumptionCards.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center text-sm text-gray-500 shadow-sm shadow-slate-900/5 dark:border-gray-800 dark:bg-[#151824] dark:text-gray-400 sm:p-8">
              Este hogar no tiene dispositivos con información de consumo.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {deviceConsumptionCards.map(
                ({ device, todayConsumption, errorMessage }) => (
                  <Card
                    key={device.id}
                    className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 dark:border-gray-800"
                  >
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-lg font-semibold tracking-tight text-[#1b254b] dark:text-white">
                            {device.name}
                          </h3>

                          <span
                            className={`mt-2 inline-flex min-h-6 shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              device.connectivityStatus === 'ONLINE'
                                ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {device.connectivityStatus}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-gray-800 sm:mt-6 sm:gap-4 sm:pt-5">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Potencia actual
                          </p>

                          <p className="mt-2 break-words text-xl font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-2xl">
                            {device.currentPowerW === null
                              ? 'Sin datos'
                              : `${device.currentPowerW} W`}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Consumo de hoy
                          </p>

                          <p className="mt-2 break-words text-xl font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-2xl">
                            {errorMessage
                              ? 'No disponible'
                              : todayConsumption?.readingsCount === 0
                                ? 'Sin datos'
                                : todayConsumption
                              ? `${todayConsumption.totalEnergyDeltaKwh.toFixed(4)} kWh`
                              : 'Sin datos'}
                          </p>
                          {errorMessage && (
                            <p
                              role="alert"
                              className="mt-1 text-xs text-red-600 dark:text-red-400"
                            >
                              {errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          )}

        </section>}

      </div>
    </div>
  );
};

export default Consumption;
