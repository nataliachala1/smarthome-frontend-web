import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../app/contexts/AuthContext';
import { listHomes, type Home } from '../../../shared/api/homes.api';
import { listDevices } from '../../../shared/api/devices.api';

interface HomeSummary {
  home: Home;
  deviceCount: number | null;
  deviceError: string | null;
}

const HomeIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-6h6v6"
    />
  </svg>
);

const DeviceIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect width="15" height="18" x="4.5" y="3" rx="2" />
    <path strokeLinecap="round" d="M9 6.5h6M10 17.5h4" />
  </svg>
);

const AlertIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
    />
    <path strokeLinecap="round" d="M12 9v4m0 4h.01" />
  </svg>
);

const FavoriteIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"
    />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    aria-hidden="true"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    aria-hidden="true"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
  </svg>
);

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [homeSummaries, setHomeSummaries] = useState<HomeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const homes = await listHomes();

      const summaries = await Promise.all(
        homes.map(async (home) => {
          try {
            const devices = await listDevices(home.id);

            return {
              home,
              deviceCount: devices.length,
              deviceError: null,
            };
          } catch (cause) {
            return {
              home,
              deviceCount: null,
              deviceError:
                cause instanceof Error
                  ? cause.message
                  : 'No fue posible cargar los dispositivos.',
            };
          }
        }),
      );

      setHomeSummaries(summaries);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible cargar el dashboard.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const totalDevices = useMemo(
    () => {
      if (homeSummaries.some((item) => item.deviceCount === null)) {
        return null;
      }

      return homeSummaries.reduce(
        (total, item) => total + (item.deviceCount ?? 0),
        0,
      );
    },
    [homeSummaries],
  );

  const enterHome = (homeId: string) => {
    localStorage.setItem('activeHomeId', homeId);
    navigate(`/homes/${homeId}/dashboard`);
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1300px]">
        <div role="status" aria-live="polite" className="rounded-2xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground shadow-sm">
          Cargando dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[1300px]">
        <div role="alert" className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive shadow-sm dark:bg-destructive/10">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="mt-3 font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sh-dashboard mx-auto w-full max-w-[1300px] space-y-6 sm:space-y-7">
      <header className="sh-dashboard-enter space-y-2.5">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
          Inicio
        </p>
        <h1 className="break-words text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Hola, {user?.name ?? 'usuario'} <span aria-hidden="true">👋</span>
        </h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Administra tus hogares y dispositivos desde un solo lugar.
        </p>
      </header>

      <section aria-label="Resumen" className="sh-dashboard-enter grid gap-4 lg:grid-cols-2">
        <div className="flex min-h-32 items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:gap-5 sm:p-6">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-16 sm:w-16">
            <HomeIcon className="h-7 w-7 sm:h-8 sm:w-8" />
          </span>
          <div className="min-w-0">
            <p className="text-base font-medium text-muted-foreground">Mis hogares</p>
            <p className="mt-1 text-4xl font-bold leading-none tracking-tight tabular-nums text-foreground">
              {homeSummaries.length}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">hogares disponibles</p>
          </div>
          <span aria-hidden="true" className="ml-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
            <ArrowRightIcon />
          </span>
        </div>

        <div className="flex min-h-32 items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:gap-5 sm:p-6">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-16 sm:w-16">
            <DeviceIcon className="h-7 w-7 sm:h-8 sm:w-8" />
          </span>
          <div className="min-w-0">
            <p className="text-base font-medium text-muted-foreground">Dispositivos</p>
            <p className="mt-1 break-words text-4xl font-bold leading-tight tracking-tight tabular-nums text-foreground">
              {totalDevices ?? 'No disponible'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalDevices === null
                ? 'No fue posible consultar todos los hogares'
                : 'dispositivos en total'}
            </p>
          </div>
          <span aria-hidden="true" className="ml-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
            <ArrowRightIcon />
          </span>
        </div>
      </section>

      <section aria-labelledby="quick-access-heading" className="sh-dashboard-enter space-y-3">
        <div>
          <h2 id="quick-access-heading" className="text-xl font-semibold tracking-tight text-foreground">
            Accesos rápidos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Accede rápidamente a las funciones principales de tu Smart Home.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/homes')}
            className="sh-dashboard-interactive group flex min-h-20 items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3 text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HomeIcon className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold text-foreground">Mis hogares</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">Consulta tus hogares</span>
            </span>
            <span className="text-muted-foreground">
              <ChevronRightIcon />
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              const activeHomeId = localStorage.getItem('activeHomeId');

              if (activeHomeId) {
                navigate(`/homes/${activeHomeId}/devices`);
              } else {
                navigate('/homes');
              }
            }}
            className="sh-dashboard-interactive group flex min-h-20 items-center gap-3 rounded-2xl border border-border/80 bg-card px-4 py-3 text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <DeviceIcon className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold text-foreground">Dispositivos</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">Consulta tus dispositivos</span>
            </span>
            <span className="text-muted-foreground">
              <ChevronRightIcon />
            </span>
          </button>
        </div>
      </section>

      <section
        aria-labelledby="homes-heading"
        className="sh-dashboard-enter rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HomeIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <h2 id="homes-heading" className="text-xl font-semibold tracking-tight text-foreground">
                Mis hogares
              </h2>
              <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                Selecciona un hogar para gestionar sus dispositivos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/homes')}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md px-1 text-sm font-semibold text-primary transition-colors duration-200 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:text-base"
          >
            Ver todos
            <ChevronRightIcon />
          </button>
        </div>

        {homeSummaries.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-border/80 bg-background/70 px-5 py-8 text-center">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HomeIcon className="h-5 w-5" />
            </span>
            <h3 className="text-base font-semibold text-foreground">
              No tienes hogares disponibles.
            </h3>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              Cuando crees un hogar aparecerá aquí para que puedas gestionarlo y ver sus dispositivos.
            </p>
            <button
              type="button"
              onClick={() => navigate('/homes')}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span aria-hidden="true" className="text-lg leading-none">+</span>
              Crear mi primer hogar
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {homeSummaries.slice(0, 4).map(({ home, deviceCount, deviceError }) => (
              <article
                key={home.id}
                className="sh-dashboard-interactive flex min-h-48 flex-col justify-between gap-5 rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:p-6"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <HomeIcon className="h-8 w-8" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-lg font-semibold text-foreground sm:text-xl">{home.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {deviceCount === null
                        ? 'Dispositivos: no disponible'
                        : `${deviceCount} dispositivo${deviceCount === 1 ? '' : 's'}`}
                    </p>
                    {deviceCount === 0 && (
                      <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-slate-400" />
                        Sin dispositivos
                      </span>
                    )}
                    {deviceError && (
                      <p className="mt-2 text-xs leading-5 text-destructive" role="status">
                        {deviceError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-1 gap-2 border-t border-border/70 pt-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => enterHome(home.id)}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none sm:text-base"
                  >
                    Entrar al hogar
                    <ChevronRightIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('activeHomeId', home.id);
                      navigate(`/homes/${home.id}/devices`);
                    }}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-primary transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none sm:text-base"
                  >
                    Ver dispositivos
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="attention-heading" className="sh-dashboard-enter space-y-3">
        <div>
          <h2 id="attention-heading" className="text-xl font-semibold tracking-tight text-foreground">
            Alertas y favoritos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisa novedades importantes y accede rápidamente a lo que guardaste.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="sh-dashboard-interactive flex min-h-24 flex-col justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-foreground">Alertas</h3>
                <p className="mt-1 max-w-sm break-words text-sm leading-5 text-muted-foreground">
                  Consulta los eventos importantes y las alertas de tus hogares.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/alerts')}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 self-start rounded-lg border border-border px-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none lg:self-center"
            >
              Ver alertas
              <ChevronRightIcon />
            </button>
          </article>

          <article className="sh-dashboard-interactive flex min-h-24 flex-col justify-between gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FavoriteIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-foreground">Favoritos</h3>
                <p className="mt-1 max-w-sm break-words text-sm leading-5 text-muted-foreground">
                  Accede rápidamente a tus hogares favoritos.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/favorites')}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1 self-start rounded-lg border border-border px-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none lg:self-center"
            >
              Ver favoritos
              <ChevronRightIcon />
            </button>
          </article>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
