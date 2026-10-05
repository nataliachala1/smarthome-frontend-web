import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const monthlyConsumption = [
  { month: 'Ene', value: 13750 },
  { month: 'Feb', value: 26750 },
  { month: 'Mar', value: 22500 },
  { month: 'Abr', value: 43787 },
  { month: 'May', value: 17750 },
  { month: 'Jun', value: 31250 },
];

const chartNumber = (value: number) =>
  value === 0 ? '0' : new Intl.NumberFormat('es-CO').format(value);

const Icon = ({
  children,
  className = 'h-5 w-5',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

const IconTile = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#1677f2] ${className}`}>
    {children}
  </div>
);

const TrendLine = ({ color }: { color: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 180 60"
    preserveAspectRatio="none"
    className="pointer-events-none absolute -bottom-1 -right-1 h-[76px] w-[48%] opacity-[0.22]"
  >
    <path
      d="M0 52 C22 48 30 33 49 39 S80 51 101 29 S129 39 148 20 S168 17 180 25"
      fill="none"
      stroke={color}
      strokeWidth="2"
    />
    <path
      d="M0 52 C22 48 30 33 49 39 S80 51 101 29 S129 39 148 20 S168 17 180 25 L180 60 L0 60Z"
      fill={color}
      opacity="0.15"
    />
  </svg>
);

const cardClass =
  'rounded-2xl border border-[#e6edf5] bg-white shadow-[0_4px_16px_rgba(37,73,125,0.045)] dark:border-slate-700 dark:bg-[#151824]';

const Reports = () => {
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setIsYearMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openNotifications = () => {
    setShowNotifications((isOpen) => {
      if (!isOpen) setUnreadCount(0);
      return !isOpen;
    });
  };

  return (
    <div className="mx-auto min-h-full w-full max-w-[1440px] space-y-4 text-[#07183d] dark:text-white">
      <header className={`${cardClass} flex min-h-[92px] flex-col justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6`}>
        <div className="flex min-w-0 items-center gap-4">
          <IconTile className="h-[52px] w-[52px] rounded-2xl">
            <Icon className="h-7 w-7"><path d="M5 19V13m5 6V9m5 10V5m5 14V3" strokeWidth="3" /></Icon>
          </IconTile>
          <div className="min-w-0">
            <h1 className="text-[28px] font-extrabold leading-8 tracking-[-0.04em] text-[#07183d] dark:text-white sm:text-[30px]">
              {t('Reportes')}
            </h1>
            <p className="mt-0.5 text-sm text-[#7182a3] dark:text-slate-400">
              {t('Sábado, 09 de mayo del 2026')}
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-full border border-[#e6edf5] bg-[#f8fafd] px-4 text-[#8190ab] sm:w-[290px] sm:flex-none lg:w-[340px]">
            <Icon className="h-5 w-5 shrink-0"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>
            <input
              type="search"
              placeholder={t('Buscar en reportes...')}
              aria-label={t('Buscar en reportes...')}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-[#253858] outline-none placeholder:text-[#8290a9] focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </label>

          <div className="relative shrink-0" ref={notificationRef}>
            <button
              type="button"
              onClick={openNotifications}
              aria-label={t('Notificaciones')}
              aria-expanded={showNotifications}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e6edf5] shadow-[0_3px_10px_rgba(37,73,125,0.07)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1677f2]/30 ${
                showNotifications
                  ? 'bg-[#eef5ff] text-[#1677f2]'
                  : 'bg-white text-[#07183d] hover:bg-[#f8fafd] dark:border-slate-700 dark:bg-[#151824] dark:text-slate-200'
              }`}
            >
              <Icon><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></Icon>
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-white bg-[#ff315a] px-0.5 text-[9px] font-bold leading-none text-white dark:border-[#151824]">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 z-40 mt-2 w-72 rounded-xl border border-[#e6edf5] bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-[#151824]">
                <h2 className="mb-2 text-sm font-bold text-[#07183d] dark:text-white">{t('Notificaciones')}</h2>
                <p className="rounded-lg bg-[#f8fafd] p-2.5 text-xs text-[#7182a3] dark:bg-slate-800 dark:text-slate-300">
                  {t('El reporte mensual de Abril ya está disponible.')}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className={`${cardClass} flex flex-col justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6`} aria-label={t('Exportar y programar reportes')}>
        <div className="flex min-w-0 items-center gap-4">
          <IconTile>
            <Icon className="h-7 w-7"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M9 14h6m-3-3v6" /></Icon>
          </IconTile>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[#07183d] dark:text-white">
              {t('Exportar y programar reportes')}
            </h2>
            <p className="mt-0.5 text-sm text-[#7182a3] dark:text-slate-400">
              {t('Genera archivos descargables automáticamente o envíalos a tu email.')}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-3 rounded-xl bg-[#1677f2] px-5 text-sm font-semibold text-white shadow-[0_3px_8px_rgba(22,119,242,0.18)] transition-colors hover:bg-[#0968df] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1677f2]/40"
        >
          <Icon className="h-5 w-5"><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.9Z" transform="translate(-1 -1)" /></Icon>
          {t('Configurar Reporte')}
        </button>
      </section>

      <section className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label={t('Resumen de reportes')}>
        <article className={`${cardClass} relative flex min-h-[174px] flex-col justify-between overflow-hidden p-5 sm:p-6`}>
          <div className="relative z-10 flex items-start justify-between gap-2">
            <div className="flex items-center gap-3.5">
              <IconTile className="h-12 w-12 rounded-full bg-[#eaf2ff]">
                <Icon className="h-6 w-6"><path d="M5 19v-5m5 5V9m5 10V5m5 14V3" strokeWidth="2.8" /></Icon>
              </IconTile>
              <div>
                <h2 className="text-base font-bold text-[#07183d] dark:text-white">{t('Consumo total')}</h2>
                <span className="mt-1 inline-flex rounded-full bg-[#eef5ff] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1677f2]">
                  {t('Historial')}
                </span>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#eafbf2] px-3 py-1.5 text-xs font-bold text-[#0aa35a]">
              <Icon className="h-4 w-4"><path d="M7 17 17 7M8 7h9v9" /></Icon>
              +2.08%
            </span>
          </div>
          <div className="relative z-10 mt-3">
            <p className="text-[38px] font-extrabold leading-none tracking-[-0.045em] text-[#07183d] dark:text-white sm:text-[42px]">$612.917</p>
            <p className="mt-2 text-sm text-[#7182a3] dark:text-slate-400">{t('Total del período actual')}</p>
          </div>
          <TrendLine color="#1677f2" />
        </article>

        <article className={`${cardClass} relative flex min-h-[174px] flex-col justify-between overflow-hidden p-5 sm:p-6`}>
          <div className="relative z-10 flex items-start justify-between gap-2">
            <div className="flex items-center gap-3.5">
              <IconTile className="h-12 w-12 rounded-full bg-[#e8fbf5] text-[#08a5c8]">
                <Icon className="h-6 w-6"><path d="M5 12a7 7 0 0 1 7-7h2a6 6 0 0 1 6 6v4a2 2 0 0 1-2 2h-1" /><path d="M6 12H4a2 2 0 0 0 0 4h2m3 2a2 2 0 0 0 4 0m-6-7h.01M15 9h.01M7 6 5 4m12 2 2-2" /><circle cx="12" cy="13" r="9" /></Icon>
              </IconTile>
              <h2 className="text-base font-bold text-[#07183d] dark:text-white">{t('Consumo de ahorro')}</h2>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#eafbf2] px-3 py-1.5 text-xs font-bold text-[#0aa35a]">
              <Icon className="h-4 w-4"><path d="M7 17 17 7M8 7h9v9" /></Icon>
              +12.4%
            </span>
          </div>
          <div className="relative z-10 mt-3">
            <p className="text-[38px] font-extrabold leading-none tracking-[-0.045em] text-[#07183d] dark:text-white sm:text-[42px]">34.760</p>
            <p className="mt-2 text-sm text-[#7182a3] dark:text-slate-400">{t('Ahorro acumulado')}</p>
          </div>
          <TrendLine color="#29c99a" />
        </article>

        <article className={`${cardClass} min-h-[174px] p-5 sm:p-6`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3.5">
              <IconTile className="h-12 w-12">
                <Icon className="h-6 w-6"><circle cx="12" cy="12" r="9" /><path d="M12 3v9h9M12 12l6.4 6.4" /></Icon>
              </IconTile>
              <h2 className="text-base font-bold text-[#07183d] dark:text-white">{t('Estadísticas del producto')}</h2>
            </div>
            <span className="shrink-0 text-sm text-[#7182a3] dark:text-slate-400">{t('Hoy')}</span>
          </div>
          <div className="mt-1 flex items-center justify-center">
            <div className="relative flex h-[112px] w-[112px] items-center justify-center rounded-full">
              <svg aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="46" fill="none" stroke="#edf1f5" strokeWidth="12" />
                <circle cx="56" cy="56" r="46" fill="none" stroke="#1677f2" strokeWidth="12" strokeLinecap="round" strokeDasharray="289" strokeDashoffset="220" />
              </svg>
              <div className="relative text-center">
                <p className="text-[21px] font-bold leading-6 text-[#07183d] dark:text-white">9.829</p>
                <p className="mt-0.5 text-[11px] text-[#7182a3] dark:text-slate-400">{t('Total hoy')}</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className={`${cardClass} p-4 sm:p-6`} aria-label={t('Consumo')}>
        <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <IconTile>
              <Icon className="h-6 w-6"><path d="M5 19v-5m5 5V9m5 10V5m5 14V3" strokeWidth="2.8" /></Icon>
            </IconTile>
            <div>
              <h2 className="text-lg font-bold leading-6 text-[#07183d] dark:text-white">{t('Consumo')}</h2>
              <p className="mt-0.5 text-sm text-[#7182a3] dark:text-slate-400">{t('Seguimiento del consumo de sus clientes')}</p>
            </div>
          </div>

          <div className="relative self-start sm:self-auto" ref={yearRef}>
            <button
              type="button"
              onClick={() => setIsYearMenuOpen((isOpen) => !isOpen)}
              aria-expanded={isYearMenuOpen}
              className="flex h-10 items-center gap-2.5 rounded-xl border border-[#e6edf5] bg-white px-3.5 text-sm font-medium text-[#253858] transition-colors hover:bg-[#f8fafd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1677f2]/30 dark:border-slate-700 dark:bg-[#151824] dark:text-slate-200"
            >
              <Icon className="h-5 w-5 text-[#7182a3]"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></Icon>
              {selectedYear}
              <Icon className="h-4 w-4 text-[#7182a3]"><path d="m6 9 6 6 6-6" /></Icon>
            </button>

            {isYearMenuOpen && (
              <div className="absolute right-0 z-30 mt-1 w-28 overflow-hidden rounded-xl border border-[#e6edf5] bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-[#151824]">
                {['2024', '2025', '2026', '2027', '2028'].map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      setSelectedYear(year);
                      setIsYearMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-[#f5f8fc] dark:hover:bg-slate-800 ${
                      selectedYear === year ? 'text-[#1677f2]' : 'text-[#50658c] dark:text-slate-300'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative h-[205px] w-full sm:h-[225px]">
          <div className="pointer-events-none absolute left-[58%] top-0 z-10 -translate-x-1/2 rounded-lg bg-[#071833] px-3 py-1.5 text-center text-white shadow-sm">
            <p className="text-xs font-bold leading-4">43.787</p>
            <p className="text-xs leading-4">{t('Consumo')}</p>
            <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-[#071833]" />
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyConsumption} margin={{ top: 38, right: 2, bottom: 0, left: 0 }} barCategoryGap="25%">
              <CartesianGrid vertical={false} stroke="#e3eaf3" strokeDasharray="2 4" />
              <XAxis
                dataKey="month"
                axisLine={{ stroke: '#dce4ef' }}
                tickLine={false}
                tick={{ fill: '#7182a3', fontSize: 12 }}
                dy={8}
              />
              <YAxis
                domain={[0, 60000]}
                ticks={[0, 15000, 30000, 45000, 60000]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#7182a3', fontSize: 12 }}
                tickFormatter={chartNumber}
                width={52}
              />
              <Tooltip cursor={false} content={() => null} />
              <Bar dataKey="value" radius={[9, 9, 0, 0]} maxBarSize={148}>
                {monthlyConsumption.map((entry) => (
                  <Cell key={entry.month} fill={entry.month === 'Abr' ? '#1677f2' : '#dfebfa'} />
                ))}
              </Bar>
              <ReferenceDot x="Abr" y={43787} r={5} fill="#1677f2" stroke="#ffffff" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export { Reports };
export default Reports;
