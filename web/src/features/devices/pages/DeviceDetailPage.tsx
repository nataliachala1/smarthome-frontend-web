import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  controlDevice,
  getDevice,
  type Device,
} from '../../../shared/api/devices.api';
import { getHome, type Home } from '../../../shared/api/homes.api';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { getRealtimeSocket } from '../../../shared/realtime/realtime-client';

interface DeviceStatusUpdatedEvent {
  id: string;
  homeId: string;
  connectivityStatus: 'ONLINE' | 'OFFLINE';
  isOn: boolean;
  currentPowerW: number | null;
  updatedAt: string;
}

export const DeviceDetailPage = () => {
  const navigate = useNavigate();

  const { homeId, deviceId } = useParams<{
    homeId: string;
    deviceId: string;
  }>();

  const [home, setHome] = useState<Home | null>(null);
  const [device, setDevice] = useState<Device | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isControlling, setIsControlling] = useState(false);
  const [error, setError] = useState('');

  const loadDevice = useCallback(async () => {
    if (!homeId || !deviceId) {
      setError('No se encontró el dispositivo seleccionado.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const [homeResponse, deviceResponse] = await Promise.all([
        getHome(homeId),
        getDevice(homeId, deviceId),
      ]);

      setHome(homeResponse);
      setDevice(deviceResponse);

      localStorage.setItem('activeHomeId', homeId);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible cargar el dispositivo.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [homeId, deviceId]);

  useEffect(() => {
    void loadDevice();
  }, [loadDevice]);

  useEffect(() => {
    const socket = getRealtimeSocket();

    if (!socket || !homeId || !deviceId) {
      return;
    }

    const handleDeviceStatusUpdated = (
      payload: DeviceStatusUpdatedEvent,
    ) => {
      if (
        payload.homeId !== homeId ||
        payload.id !== deviceId
      ) {
        return;
      }

      setDevice((currentDevice) => {
        if (!currentDevice) {
          return currentDevice;
        }

        return {
          ...currentDevice,
          connectivityStatus: payload.connectivityStatus,
          isOn: payload.isOn,
          currentPowerW: payload.currentPowerW,
          updatedAt: payload.updatedAt,
        };
      });
    };

    socket.on(
      'device.status.updated',
      handleDeviceStatusUpdated,
    );

    return () => {
      socket.off(
        'device.status.updated',
        handleDeviceStatusUpdated,
      );
    };
  }, [homeId, deviceId]);

  const handleControl = async () => {
    if (!homeId || !device) return;

    setIsControlling(true);
    setError('');

    try {
      await controlDevice(
        homeId,
        device.id,
        device.isOn ? 'TURN_OFF' : 'TURN_ON',
      );

      await loadDevice();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible controlar el dispositivo.',
      );
    } finally {
      setIsControlling(false);
    }
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
          Cargando dispositivo...
        </div>
      </main>
    );
  }

  if (error && !device) {
    return (
      <main className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              navigate(`/homes/${homeId}/devices`)
            }
            className="mt-3 font-semibold underline"
          >
            Volver a dispositivos
          </button>
        </div>
      </main>
    );
  }

  if (!device) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f4f7fe] p-6 dark:bg-[#0f111a]">
      <div className="mx-auto max-w-5xl space-y-7">

        <header>
          <button
            type="button"
            onClick={() =>
              navigate(`/homes/${homeId}/devices`)
            }
            className="mb-3 text-sm font-semibold text-[#1866C1] hover:underline"
          >
            ← Volver a dispositivos
          </button>

          <h1 className="text-3xl font-bold text-[#1b254b] dark:text-white">
            {device.name}
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {home?.name}
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300"
          >
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">

          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">
                Conectividad
              </p>

              <p className="mt-2 text-2xl font-bold text-[#1b254b] dark:text-white">
                {device.connectivityStatus}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">
                Estado
              </p>

              <p className="mt-2 text-2xl font-bold text-[#1b254b] dark:text-white">
                {device.isOn ? 'Encendido' : 'Apagado'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">
                Potencia actual
              </p>

              <p className="mt-2 text-2xl font-bold text-[#1b254b] dark:text-white">
                {device.currentPowerW ?? 0} W
              </p>
            </CardContent>
          </Card>

        </section>

        <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
          <CardContent className="p-6">

            <h2 className="text-xl font-bold text-[#1b254b] dark:text-white">
              Información del dispositivo
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Nombre
                </p>

                <p className="mt-1 text-sm font-medium text-[#1b254b] dark:text-white">
                  {device.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Estado del registro
                </p>

                <p className="mt-1 text-sm font-medium text-[#1b254b] dark:text-white">
                  {device.status}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Identificador del fabricante
                </p>

                <p className="mt-1 text-sm font-medium text-[#1b254b] dark:text-white">
                  {device.manufacturerDeviceId || 'No disponible'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Transporte
                </p>

                <p className="mt-1 text-sm font-medium text-[#1b254b] dark:text-white">
                  {device.transportType || 'No disponible'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Protocolo
                </p>

                <p className="mt-1 text-sm font-medium text-[#1b254b] dark:text-white">
                  {device.messagingProtocol || 'No disponible'}
                </p>
              </div>

            </div>

          </CardContent>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2">

          <Button
            type="button"
            variant="primary"
            disabled={
              isControlling ||
              device.connectivityStatus !== 'ONLINE'
            }
            onClick={() => void handleControl()}
          >
            {isControlling
              ? 'Enviando comando...'
              : device.isOn
                ? 'Apagar dispositivo'
                : 'Encender dispositivo'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              navigate(
                `/homes/${homeId}/devices/${device.id}/edit`,
              )
            }
          >
            Editar dispositivo
          </Button>

        </section>

      </div>
    </main>
  );
};

export default DeviceDetailPage;