import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getHome, type Home } from '../../../shared/api/homes.api';
import {
  listDevices,
  type Device,
} from '../../../shared/api/devices.api';
import { Card, CardContent } from '../../../components/ui/Card';

export const HomeDashboardPage = () => {
  const navigate = useNavigate();
  const { homeId } = useParams<{ homeId: string }>();

  const [home, setHome] = useState<Home | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHomeDashboard = async () => {
      if (!homeId) {
        setError('No se encontró el hogar seleccionado.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const [homeResponse, devicesResponse] = await Promise.all([
          getHome(homeId),
          listDevices(homeId),
        ]);

        setHome(homeResponse);
        setDevices(devicesResponse);

        localStorage.setItem('activeHomeId', homeId);
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'No fue posible cargar la información del hogar.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadHomeDashboard();
  }, [homeId]);

  const onlineDevices = devices.filter(
    (device) => device.connectivityStatus === 'ONLINE',
  ).length;

  const offlineDevices = devices.filter(
    (device) => device.connectivityStatus === 'OFFLINE',
  ).length;

  const activeDevices = devices.filter(
    (device) => device.isOn,
  ).length;

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
          Cargando hogar...
        </div>
      </main>
    );
  }

  if (error || !home) {
    return (
      <main className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <p>{error || 'No se encontró el hogar.'}</p>

          <button
            type="button"
            onClick={() => navigate('/homes')}
            className="mt-3 font-semibold underline"
          >
            Volver a Mis hogares
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-8">

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mb-3 text-sm font-semibold text-[#1866C1] hover:underline"
          >
            ← Volver al Dashboard
          </button>

          <h1 className="text-3xl font-bold text-[#1b254b] dark:text-white">
            {home.name}
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Resumen del hogar seleccionado
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Dispositivos
            </p>

            <p className="mt-2 text-3xl font-bold text-[#1b254b] dark:text-white">
              {devices.length}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Online
            </p>

            <p className="mt-2 text-3xl font-bold text-[#1b254b] dark:text-white">
              {onlineDevices}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Offline
            </p>

            <p className="mt-2 text-3xl font-bold text-[#1b254b] dark:text-white">
              {offlineDevices}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Encendidos
            </p>

            <p className="mt-2 text-3xl font-bold text-[#1b254b] dark:text-white">
              {activeDevices}
            </p>
          </CardContent>
        </Card>

      </section>

      <section className="space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1b254b] dark:text-white">
            Dispositivos del hogar
          </h2>

          <button
            type="button"
            onClick={() => navigate(`/homes/${home.id}/devices`)}
            className="text-sm font-semibold text-[#1866C1] hover:underline"
          >
            Ver todos
          </button>
        </div>

        {devices.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
            Este hogar no tiene dispositivos registrados.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {devices.slice(0, 6).map((device) => (
              <Card
                key={device.id}
                className="rounded-2xl border border-gray-100 dark:border-gray-800"
              >
                <CardContent className="p-5">

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[#1b254b] dark:text-white">
                        {device.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {device.connectivityStatus}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        device.isOn
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {device.isOn ? 'Encendido' : 'Apagado'}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Potencia actual:{' '}
                    <span className="font-semibold text-[#1b254b] dark:text-white">
                      {device.currentPowerW ?? 0} W
                    </span>
                  </p>

                </CardContent>
              </Card>
            ))}

          </div>
        )}

      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-[#1b254b] dark:text-white">
          Accesos del hogar
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">

          <button
            type="button"
            onClick={() => navigate(`/homes/${home.id}/devices`)}
            className="rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 dark:border-gray-800 dark:bg-[#151824]"
          >
            <p className="font-semibold text-[#1b254b] dark:text-white">
              Dispositivos
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Consulta y controla los dispositivos de este hogar
            </p>
          </button>

        </div>
      </section>

    </main>
  );
};

export default HomeDashboardPage;