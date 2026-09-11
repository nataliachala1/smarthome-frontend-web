import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/contexts/AuthContext';
import { listHomes, type Home } from '../../../shared/api/homes.api';
import { listDevices } from '../../../shared/api/devices.api';
import { Card, CardContent } from '../../../components/ui/Card';

interface HomeSummary {
  home: Home;
  deviceCount: number;
}

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
      <main className="p-6">
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
          Cargando dashboard...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="mt-3 font-semibold underline"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-8">

      <header>
        <h1 className="text-3xl font-bold text-[#1b254b] dark:text-white">
          Dashboard
        </h1>

        <p className="mt-2 text-xl text-[#1b254b] dark:text-white">
          Hola, {user?.name ?? 'usuario'}
        </p>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Administra tus hogares y dispositivos desde un solo lugar.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">

        <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mis hogares
            </p>

            <p className="mt-2 text-4xl font-bold text-[#1b254b] dark:text-white">
              {homeSummaries.length}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              hogares disponibles
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Dispositivos
            </p>

            <p className="mt-2 text-4xl font-bold text-[#1b254b] dark:text-white">
              {totalDevices}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              dispositivos en total
            </p>
          </CardContent>
        </Card>

      </section>

      <section className="space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1b254b] dark:text-white">
            Mis hogares
          </h2>

          <button
            type="button"
            onClick={() => navigate('/homes')}
            className="text-sm font-semibold text-[#1866C1] hover:underline"
          >
            Ver todos
          </button>
        </div>

        {homeSummaries.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
            No tienes hogares disponibles.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">

            {homeSummaries.slice(0, 4).map(({ home, deviceCount }) => (
              <Card
                key={home.id}
                className="rounded-2xl border border-gray-100 dark:border-gray-800"
              >
                <CardContent className="p-6">

                  <h3 className="text-lg font-semibold text-[#1b254b] dark:text-white">
                    {home.name}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {deviceCount} dispositivo
                    {deviceCount === 1 ? '' : 's'}
                  </p>

                  <button
                    type="button"
                    onClick={() => enterHome(home.id)}
                    className="mt-5 w-full rounded-xl bg-[#1866C1] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1557a3]"
                  >
                    Entrar al hogar
                  </button>

                </CardContent>
              </Card>
            ))}

          </div>
        )}

      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-[#1b254b] dark:text-white">
          Accesos rápidos
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">

          <button
            type="button"
            onClick={() => navigate('/homes')}
            className="rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 dark:border-gray-800 dark:bg-[#151824]"
          >
            <p className="font-semibold text-[#1b254b] dark:text-white">
              Mis hogares
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Consulta tus hogares
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/devices')}
            className="rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 dark:border-gray-800 dark:bg-[#151824]"
          >
            <p className="font-semibold text-[#1b254b] dark:text-white">
              Dispositivos
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Consulta tus dispositivos
            </p>
          </button>

        </div>
      </section>

    </main>
  );
};

export default DashboardPage;