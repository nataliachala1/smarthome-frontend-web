import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getHome, type Home } from '../../../shared/api/homes.api';
import {
  listDevices,
  type Device,
} from '../../../shared/api/devices.api';
import { Card, CardContent } from '../../../components/ui/Card';
import { IsometricHomeScene } from '../../../components/ui/IsometricHomeScene';

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
      <div className="sh-page-enter">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-gray-500 shadow-sm shadow-slate-900/5 dark:border-gray-800 dark:bg-[#151824] dark:text-gray-400">
          Cargando hogar...
        </div>
      </div>
    );
  }

  if (error || !home) {
    return (
      <div className="sh-page-enter">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm shadow-red-900/5 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300 sm:p-6">
          <p>{error || 'No se encontró el hogar.'}</p>

          <button
            type="button"
            onClick={() => navigate('/homes')}
            className="mt-3 inline-flex min-h-11 items-center rounded-lg font-semibold underline underline-offset-4 transition-colors duration-200 hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:hover:text-red-200 dark:focus-visible:ring-offset-gray-950 motion-reduce:transition-none"
          >
            Volver a Mis hogares
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 sh-page-enter sm:space-y-8">

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mb-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#1866C1] transition-colors duration-200 hover:underline underline-offset-4 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1] focus-visible:ring-offset-4 motion-reduce:transition-none"
          >
            ← Volver al Dashboard
          </button>

          <h1 className="break-words text-2xl font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-3xl">
            {home.name}
          </h1>

          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Resumen del hogar seleccionado
          </p>
        </div>

        <IsometricHomeScene variant="compact" />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 transition-[border-color,box-shadow] duration-200 hover:border-blue-200 hover:shadow-md motion-reduce:transition-none dark:border-gray-800 dark:hover:border-blue-900">
          <CardContent className="p-5 sm:p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Dispositivos
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-[#1b254b] dark:text-white">
              {devices.length}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 transition-[border-color,box-shadow] duration-200 hover:border-blue-200 hover:shadow-md motion-reduce:transition-none dark:border-gray-800 dark:hover:border-blue-900">
          <CardContent className="p-5 sm:p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Online
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-[#1b254b] dark:text-white">
              {onlineDevices}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 transition-[border-color,box-shadow] duration-200 hover:border-blue-200 hover:shadow-md motion-reduce:transition-none dark:border-gray-800 dark:hover:border-blue-900">
          <CardContent className="p-5 sm:p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Offline
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-[#1b254b] dark:text-white">
              {offlineDevices}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 transition-[border-color,box-shadow] duration-200 hover:border-blue-200 hover:shadow-md motion-reduce:transition-none dark:border-gray-800 dark:hover:border-blue-900">
          <CardContent className="p-5 sm:p-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Encendidos
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-[#1b254b] dark:text-white">
              {activeDevices}
            </p>
          </CardContent>
        </Card>

      </section>

      <section className="space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-xl">
            Dispositivos del hogar
          </h2>

          <button
            type="button"
            onClick={() => navigate(`/homes/${home.id}/devices`)}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-[#1866C1] transition-colors duration-200 hover:underline underline-offset-4 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1] focus-visible:ring-offset-4 motion-reduce:transition-none"
          >
            Ver todos
          </button>
        </div>

        {devices.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-gray-500 shadow-sm shadow-slate-900/5 dark:border-gray-800 dark:bg-[#151824] dark:text-gray-400">
            Este hogar no tiene dispositivos registrados.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {devices.slice(0, 6).map((device) => (
              <Card
                key={device.id}
                className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none dark:border-gray-800 dark:hover:border-blue-900"
              >
                <CardContent className="p-5">

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-semibold tracking-tight text-[#1b254b] dark:text-white">
                        {device.name}
                      </h3>

                      <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-gray-800 dark:text-gray-300">
                        {device.connectivityStatus}
                      </p>
                    </div>

                    <span
                      className={`sh-device-state shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        device.isOn
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {device.isOn ? 'Encendido' : 'Apagado'}
                    </span>
                  </div>

                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Potencia actual:{' '}
                    <span className="font-semibold text-[#1b254b] dark:text-white">
                      {device.currentPowerW === null
                        ? 'Sin datos'
                        : `${device.currentPowerW} W`}
                    </span>
                  </p>

                </CardContent>
              </Card>
            ))}

          </div>
        )}

      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-xl">
          Accesos del hogar
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">

          <button
            type="button"
            onClick={() => navigate(`/homes/${home.id}/devices`)}
            className="min-h-28 rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-sm shadow-slate-900/5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none dark:border-gray-800 dark:bg-[#151824] dark:hover:border-blue-900 dark:focus-visible:ring-offset-gray-950"
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

    </div>
  );
};

export default HomeDashboardPage;
