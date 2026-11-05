import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';

import { Card, CardContent } from '../../components/ui/Card';
import { isApiError } from '../../shared/api/errors';
import {
  createHomeEnergyTariff,
  getCurrentHomeEnergyTariff,
  getHomeEnergyGoal,
  getHomeEnergySummary,
  listHomeEnergyTariffs,
  upsertHomeEnergyGoal,
  type HomeEnergyGoal,
  type HomeEnergySummary,
  type HomeEnergyTariff,
} from '../../shared/api/energy.api';

interface HomeEnergySectionProps {
  homeId: string;
  month: string;
  canManage: boolean;
}

const getBogotaDate = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

  return `${value('year')}-${value('month')}-${value('day')}`;
};

const formatMonth = (month: string) => {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('es-CO', {
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Bogota',
  }).format(new Date(Date.UTC(year, monthNumber - 1, 15)));
};

const formatDate = (date: string) => {
  const [year, month, day] = date.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
};

// Format the decimal strings without converting them to binary floating point.
const formatDecimal = (value: string) => {
  const [integer = '0', fraction] = value.split('.');
  const groupedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return fraction ? `${groupedInteger},${fraction}` : groupedInteger;
};

const formatCop = (value: string | null) =>
  value === null ? 'No disponible' : `COP ${formatDecimal(value)}`;

const isPositiveDecimal = (
  value: string,
  maxIntegerDigits: number,
  maxFractionDigits: number,
) => {
  if (!/^\d+(?:\.\d+)?$/.test(value)) return false;
  const [integer, fraction = ''] = value.split('.');
  return integer.length <= maxIntegerDigits &&
    fraction.length <= maxFractionDigits &&
    /[1-9]/.test(value);
};

const errorMessage = (cause: unknown, fallback: string) => {
  if (
    isApiError(cause) &&
    cause.status === 404 &&
    /^Cannot GET .*\/energy\//i.test(cause.message)
  ) {
    return 'El backend conectado aún no tiene disponibles las rutas de energía. Actualízalo con el módulo de energía y pulsa Reintentar.';
  }

  return cause instanceof Error ? cause.message : fallback;
};

export const HomeEnergySection = ({ homeId, month, canManage }: HomeEnergySectionProps) => {
  const requestId = useRef(0);
  const [summary, setSummary] = useState<HomeEnergySummary | null>(null);
  const [goal, setGoal] = useState<HomeEnergyGoal | null>(null);
  const [tariffs, setTariffs] = useState<HomeEnergyTariff[]>([]);
  const [currentTariff, setCurrentTariff] = useState<HomeEnergyTariff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingTariff, setIsCreatingTariff] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [budgetInput, setBudgetInput] = useState('');
  const [targetInput, setTargetInput] = useState('');
  const [tariffInput, setTariffInput] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(getBogotaDate);

  const loadEnergy = useCallback(async () => {
    const activeRequestId = ++requestId.current;
    setIsLoading(true);
    setError('');
    setSummary(null);
    setGoal(null);
    setTariffs([]);
    setCurrentTariff(null);

    try {
      const [summaryResponse, goalResponse, tariffResponse, currentResponse] = await Promise.all([
        getHomeEnergySummary(homeId, month),
        getHomeEnergyGoal(homeId, month),
        listHomeEnergyTariffs(homeId),
        getCurrentHomeEnergyTariff(homeId, getBogotaDate()),
      ]);
      if (activeRequestId !== requestId.current) return;

      setSummary(summaryResponse);
      setGoal(goalResponse.goal);
      setBudgetInput(goalResponse.goal?.monthlyBudgetCop ?? '');
      setTargetInput(goalResponse.goal?.targetKwh ?? '');
      setTariffs(tariffResponse.tariffs);
      setCurrentTariff(currentResponse.tariff);
    } catch (cause) {
      if (activeRequestId === requestId.current) {
        setError(errorMessage(cause, 'No fue posible cargar la información energética del hogar.'));
      }
    } finally {
      if (activeRequestId === requestId.current) setIsLoading(false);
    }
  }, [homeId, month]);

  useEffect(() => {
    void loadEnergy();
    return () => { requestId.current += 1; };
  }, [loadEnergy]);

  const handleGoalSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const budget = budgetInput.trim();
    const target = targetInput.trim();

    if (!budget && !target) {
      setError('Configura un presupuesto, una meta de consumo o ambos.');
      setSuccess('');
      return;
    }
    if (budget && !isPositiveDecimal(budget, 12, 2)) {
      setError('El presupuesto debe ser positivo, usar punto decimal y tener máximo 2 decimales.');
      setSuccess('');
      return;
    }
    if (target && !isPositiveDecimal(target, 8, 6)) {
      setError('La meta debe ser positiva, usar punto decimal y tener máximo 6 decimales.');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');
    setIsSaving(true);
    try {
      await upsertHomeEnergyGoal(homeId, month, {
        monthlyBudgetCop: budget || null,
        targetKwh: target || null,
      });
      setSuccess('Presupuesto y meta actualizados.');
      await loadEnergy();
    } catch (cause) {
      setError(errorMessage(cause, 'No fue posible guardar el presupuesto y la meta.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTariffSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const unitPriceCopKwh = tariffInput.trim();

    if (!isPositiveDecimal(unitPriceCopKwh, 10, 4)) {
      setError('La tarifa debe ser positiva, usar punto decimal y tener máximo 4 decimales.');
      setSuccess('');
      return;
    }
    if (!effectiveFrom) {
      setError('Selecciona la fecha de vigencia de la tarifa.');
      setSuccess('');
      return;
    }

    setError('');
    setSuccess('');
    setIsCreatingTariff(true);
    try {
      await createHomeEnergyTariff(homeId, { unitPriceCopKwh, effectiveFrom });
      setTariffInput('');
      setSuccess('La nueva tarifa quedó registrada. Las tarifas anteriores se conservan en el historial.');
      await loadEnergy();
    } catch (cause) {
      setError(errorMessage(cause, 'No fue posible registrar la tarifa.'));
    } finally {
      setIsCreatingTariff(false);
    }
  };

  return (
    <section aria-labelledby="home-energy-title" className="space-y-5 border-t border-slate-200/80 pt-6 dark:border-gray-800">
      <header className="space-y-1">
        <h2 id="home-energy-title" className="text-lg font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-xl">
          Costos y metas energéticas
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          Consulta el costo estimado del periodo y el avance frente al presupuesto y la meta de consumo del hogar.
        </p>
      </header>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <p>{error}</p>
          {!isLoading && !summary && (
            <button type="button" onClick={() => void loadEnergy()} className="mt-2 inline-flex min-h-11 items-center font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
              Reintentar
            </button>
          )}
        </div>
      )}

      {success && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">{success}</p>}

      {isLoading && !summary ? (
        <div role="status" className="rounded-2xl border border-slate-200/80 bg-white p-6 text-sm text-gray-500 shadow-sm dark:border-gray-800 dark:bg-[#151824] dark:text-gray-400">
          Cargando costos y metas...
        </div>
      ) : summary ? (
        <>
          <Card noPadding className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 transition-shadow duration-200 hover:shadow-md dark:border-gray-800 motion-reduce:transition-none">
            <CardContent className="space-y-5 p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-4 dark:border-gray-800">
                <div>
                  <h3 className="text-base font-bold text-[#1b254b] dark:text-white">Resumen económico</h3>
                  <p className="mt-1 text-sm capitalize text-gray-500 dark:text-gray-400">{formatMonth(month)}</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Metric
                  label="Costo estimado"
                  value={summary.costComplete ? formatCop(summary.estimatedCostCop) : 'Incompleto'}
                />
                <Metric
                  label="Consumo del mes"
                  value={`${formatDecimal(summary.totalKwh)} kWh`}
                  detail={summary.readingsCount === 0 ? 'Sin lecturas registradas en este periodo.' : `${summary.readingsCount} ${summary.readingsCount === 1 ? 'lectura registrada' : 'lecturas registradas'}`}
                />
              </div>

              <p role="note" className="rounded-xl border border-blue-100 bg-[#f4f7fe] px-3 py-2.5 text-sm leading-6 text-[#365578] dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200">
                La tarifa es referencial. El costo estimado no corresponde al valor final de la factura.
              </p>

              <section aria-labelledby="energy-goals-progress-title" className="space-y-3">
                <h4 id="energy-goals-progress-title" className="text-sm font-semibold text-[#1b254b] dark:text-white">Avance frente a tus metas</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <GoalProgress
                    label="Presupuesto mensual"
                    configuredValue={summary.monthlyBudgetCop}
                    percentage={summary.budgetUsagePercent}
                    detail={summary.costComplete && summary.estimatedCostCop !== null && summary.monthlyBudgetCop !== null
                      ? `${formatCop(summary.estimatedCostCop)} de ${formatCop(summary.monthlyBudgetCop)}`
                      : summary.monthlyBudgetCop === null ? 'Aún no hay un presupuesto para este periodo.' : 'Avance no disponible con el costo actual.'}
                  />
                  <GoalProgress
                    label="Meta de consumo"
                    configuredValue={summary.targetKwh}
                    percentage={summary.targetUsagePercent}
                    detail={summary.targetKwh === null
                      ? 'Aún no hay una meta para este periodo.'
                      : `${formatDecimal(summary.totalKwh)} de ${formatDecimal(summary.targetKwh)} kWh`}
                  />
                </div>
              </section>

              {!summary.costComplete && (
                <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                  {summary.unpricedReadings} lecturas no tienen tarifa vigente. El costo total no está disponible; el costo parcial de {formatCop(summary.partialCostCop)} solo cubre las lecturas tarifadas.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid items-stretch gap-4 lg:grid-cols-2">
            <Card noPadding className="h-full rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 transition-shadow duration-200 hover:shadow-md dark:border-gray-800 motion-reduce:transition-none">
              <CardContent className="space-y-5 p-5 sm:p-6">
                <div>
                  <h3 className="text-base font-bold text-[#1b254b] dark:text-white">Tarifa por kWh</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Precio referencial en COP para estimar el costo de energía.</p>
                </div>
                <div className="rounded-xl bg-[#f4f7fe] p-4 dark:bg-slate-800/60">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Vigente hoy · {formatDate(getBogotaDate())}</p>
                  <p className="mt-1 text-lg font-bold text-[#1b254b] dark:text-white">
                    {currentTariff ? `COP ${formatDecimal(currentTariff.unitPriceCopKwh)} / kWh` : 'No hay tarifa vigente para hoy'}
                  </p>
                </div>

                {canManage && (
                  <form onSubmit={(event) => void handleTariffSubmit(event)} className="space-y-3 border-t border-slate-100 pt-4 dark:border-gray-800">
                    <h4 className="text-sm font-semibold text-[#1b254b] dark:text-white">Registrar nueva vigencia</h4>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tarifa (COP/kWh)
                      <input type="text" inputMode="decimal" autoComplete="off" maxLength={15} value={tariffInput} onChange={(event) => setTariffInput(event.target.value)} placeholder="950.2500" required className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#1b254b] outline-none transition-colors focus:border-[#1866C1] focus:ring-2 focus:ring-[#1866C1]/20 dark:border-gray-700 dark:bg-[#101827] dark:text-white" />
                    </label>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fecha de vigencia
                      <input type="date" value={effectiveFrom} onChange={(event) => setEffectiveFrom(event.target.value)} required className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#1b254b] outline-none transition-colors focus:border-[#1866C1] focus:ring-2 focus:ring-[#1866C1]/20 dark:border-gray-700 dark:bg-[#101827] dark:text-white" />
                    </label>
                    <button type="submit" disabled={isCreatingTariff || isLoading} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1866C1] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1457a4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1]/40 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none">
                      {isCreatingTariff ? 'Guardando...' : 'Guardar tarifa'}
                    </button>
                  </form>
                )}

                <div className="border-t border-slate-100 pt-4 dark:border-gray-800">
                  <h4 className="text-sm font-semibold text-[#1b254b] dark:text-white">Historial de tarifas</h4>
                  {tariffs.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No hay tarifas registradas.</p>
                  ) : (
                    <ul className="mt-2 max-h-52 divide-y divide-slate-100 overflow-y-auto dark:divide-gray-800">
                      {tariffs.map((tariff) => (
                        <li key={tariff.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Desde {formatDate(tariff.effectiveFrom)}</span>
                          <span className="shrink-0 font-semibold text-[#1b254b] dark:text-white">COP {formatDecimal(tariff.unitPriceCopKwh)} / kWh</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!canManage && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Solo el propietario puede registrar una tarifa nueva.</p>}
                </div>
              </CardContent>
            </Card>

            <Card noPadding className="h-full rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 transition-shadow duration-200 hover:shadow-md dark:border-gray-800 motion-reduce:transition-none">
              <CardContent className="space-y-5 p-5 sm:p-6">
                <div>
                  <h3 className="text-base font-bold text-[#1b254b] dark:text-white">Presupuesto y meta mensual</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configura presupuesto, meta de consumo o ambos para {formatMonth(month)}.</p>
                </div>
                {canManage ? (
                  <form onSubmit={(event) => void handleGoalSubmit(event)} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Presupuesto (COP)
                      <input type="text" inputMode="decimal" autoComplete="off" maxLength={15} value={budgetInput} onChange={(event) => setBudgetInput(event.target.value)} placeholder="120000.00" className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#1b254b] outline-none transition-colors focus:border-[#1866C1] focus:ring-2 focus:ring-[#1866C1]/20 dark:border-gray-700 dark:bg-[#101827] dark:text-white" />
                    </label>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Meta de consumo (kWh)
                      <input type="text" inputMode="decimal" autoComplete="off" maxLength={15} value={targetInput} onChange={(event) => setTargetInput(event.target.value)} placeholder="125.000000" className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#1b254b] outline-none transition-colors focus:border-[#1866C1] focus:ring-2 focus:ring-[#1866C1]/20 dark:border-gray-700 dark:bg-[#101827] dark:text-white" />
                    </label>
                    <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">Usa punto decimal. Deja en blanco el valor que no quieras configurar; al menos uno debe tener un valor positivo.</p>
                    <button type="submit" disabled={isSaving || isLoading} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1866C1] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1457a4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1]/40 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none">
                      {isSaving ? 'Guardando...' : 'Guardar presupuesto y meta'}
                    </button>
                  </form>
                ) : (
                  <div className="rounded-xl bg-[#f4f7fe] p-4 text-sm dark:bg-slate-800/60">
                    <p className="font-semibold text-[#1b254b] dark:text-white">
                      {!goal?.monthlyBudgetCop ? 'Sin presupuesto configurado' : `Presupuesto: ${formatCop(goal.monthlyBudgetCop)}`}
                    </p>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      {!goal?.targetKwh ? 'Sin meta de consumo configurada' : `Meta: ${formatDecimal(goal.targetKwh)} kWh`}
                    </p>
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Solo el propietario puede modificar estos valores.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </section>
  );
};

const Metric = ({ label, value, detail }: { label: string; value: string; detail?: string }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1.5 break-words text-2xl font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-3xl">{value}</p>
    {detail && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{detail}</p>}
  </div>
);

const GoalProgress = ({
  label,
  configuredValue,
  percentage,
  detail,
}: {
  label: string;
  configuredValue: string | null;
  percentage: string | null;
  detail: string;
}) => {
  const numericPercentage = percentage === null ? null : Number(percentage);
  const hasProgress = numericPercentage !== null && Number.isFinite(numericPercentage) && numericPercentage >= 0;
  const visualPercentage = hasProgress ? Math.min(numericPercentage, 100) : 0;
  const exceeded = hasProgress && numericPercentage > 100;

  return (
    <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 dark:border-gray-800 dark:bg-[#151824]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-semibold text-[#1b254b] dark:text-white">{label}</p>
        <p className="text-sm font-semibold text-[#365578] dark:text-blue-200">
          {configuredValue === null ? 'Sin configurar' : hasProgress ? `${formatDecimal(percentage!)}% utilizado` : 'Avance no disponible'}
        </p>
      </div>
      {configuredValue !== null && hasProgress && (
        <div
          role="progressbar"
          aria-label={`${label}: ${formatDecimal(percentage!)}% utilizado`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={visualPercentage}
          aria-valuetext={`${formatDecimal(percentage!)}% utilizado`}
          className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
        >
          <div
            className={`h-full origin-left rounded-full ${exceeded ? 'bg-amber-500' : 'bg-[#1866C1]'}`}
            style={{ transform: `scaleX(${visualPercentage / 100})` }}
          />
        </div>
      )}
      <p className="mt-2 text-sm leading-5 text-gray-500 dark:text-gray-400">{detail}</p>
      {exceeded && <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">Se superó el límite configurado.</p>}
    </div>
  );
};
