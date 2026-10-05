import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/contexts/AuthContext';
import { listHomes, type Home } from '../../../shared/api/homes.api';
import { listDevices } from '../../../shared/api/devices.api';

interface HomeSummary {
  home: Home;
  deviceCount: number;
}

const HomeIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="m3 10 9-7 9 7M5 9v11h14V9M9 20v-6h6v6" />
  </svg>
);

const DeviceIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <rect width="15" height="18" x="4.5" y="3" rx="2" />
    <path strokeLinecap="round" d="M9 6.5h6M10 17.5h4" />
  </svg>
);

const AlertIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path strokeLinecap="round" d="M12 9v4m0 4h.01" />
  </svg>
);

const FavoriteIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
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
            };
          } catch {
            return {
              home,
              deviceCount: 0,
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
    () =>
      homeSummaries.reduce(
        (total, item) => total + item.deviceCount,
        0,
      ),
    [homeSummaries],
  );

  const enterHome = (homeId: string) => {
    localStorage.setItem('activeHomeId', homeId);

    navigate(`/homes/${homeId}/dashboard`);
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground shadow-sm">
          Cargando dashboard...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive dark:bg-destructive/10">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="mt-3 font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-7 sm:space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Inicio
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Hola, {user?.name ?? 'usuario'} <span aria-hidden="true">👋</span>
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Administra tus hogares y dispositivos desde un solo lugar.
        </p>
      </header>

      <section aria-label="Resumen" className="grid gap-4 md:grid-cols-2">
        <div className="flex min-h-28 items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HomeIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Mis hogares</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {homeSummaries.length}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">hogares disponibles</p>
          </div>
        </div>

        <div className="flex min-h-28 items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <DeviceIcon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Dispositivos</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {totalDevices}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">dispositivos en total</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="quick-access-heading" className="space-y-3">
        <div>
          <h2 id="quick-access-heading" className="text-lg font-semibold tracking-tight text-foreground">
            Accesos rápidos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Accede rápidamente a las funciones principales de tu Smart Home.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/homes')}
            className="group flex min-h-20 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HomeIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">Mis hogares</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">Consulta tus hogares</span>
            </span>
            <span className="text-muted-foreground transition-transform group-hover:translate-x-0.5">
              <ChevronRightIcon />
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/devices')}
            className="group flex min-h-20 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DeviceIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">Dispositivos</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">Consulta tus dispositivos</span>
            </span>
            <span className="text-muted-foreground transition-transform group-hover:translate-x-0.5">
              <ChevronRightIcon />
            </span>
          </button>
        </div>
      </section>

      <section
        aria-labelledby="homes-heading"
        className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HomeIcon className="h-5 w-5" />
            </span>
            <h2 id="homes-heading" className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              Mis hogares
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/homes')}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <div className="grid gap-3 sm:grid-cols-2">
            {homeSummaries.slice(0, 4).map(({ home, deviceCount }) => (
              <article
                key={home.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-background/50 p-5 transition-colors hover:border-primary/30"
              >
                <div>
                  <h3 className="text-base font-semibold text-foreground">{home.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {deviceCount} dispositivo
                    {deviceCount === 1 ? '' : 's'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => enterHome(home.id)}
                  className="mt-5 self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Entrar al hogar
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="attention-heading" className="space-y-3">
        <div>
          <h2 id="attention-heading" className="text-lg font-semibold tracking-tight text-foreground">
            Alertas y favoritos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisa novedades importantes y accede rápidamente a lo que guardaste.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="flex min-h-36 flex-col justify-between gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertIcon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-foreground">Alertas</h3>
                <p className="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">
                  Consulta los eventos importantes y las alertas de tus hogares.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/alerts')}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1 self-start rounded-lg border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-center"
            >
              Ver alertas
              <ChevronRightIcon />
            </button>
          </article>

          <article className="flex min-h-36 flex-col justify-between gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FavoriteIcon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-foreground">Favoritos</h3>
                <p className="mt-1 max-w-sm text-sm leading-5 text-muted-foreground">
                  Accede rápidamente a tus hogares favoritos.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/favorites')}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-1 self-start rounded-lg border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-center"
            >
              Ver favoritos
              <ChevronRightIcon />
            </button>
          </article>
        </div>
      </section>

    </main>
  );
};

export default DashboardPage;
