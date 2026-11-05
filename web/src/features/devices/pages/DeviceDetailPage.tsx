import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  controlDevice,
  deactivateDevice,
  deleteDevice,
  getDevice,
  type Device,
} from '../../../shared/api/devices.api';
import { getHome, listMembers, type Home, type HomeMember } from '../../../shared/api/homes.api';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { getRealtimeSocket } from '../../../shared/realtime/realtime-client';
import { useAuth } from '../../../app/contexts/AuthContext';

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
  const { user } = useAuth();

  const { homeId, deviceId } = useParams<{
    homeId: string;
    deviceId: string;
  }>();

  const [home, setHome] = useState<Home | null>(null);
  const [device, setDevice] = useState<Device | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isControlling, setIsControlling] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentMembership, setCurrentMembership] =
    useState<HomeMember | null>(null);

  const hasActiveMembership =
    currentMembership?.homeId === homeId &&
    currentMembership?.userId === user?.id &&
    currentMembership?.status === 'ACTIVE';

  const isOwner =
    hasActiveMembership && currentMembership?.role === 'OWNER';

  const canControlDevice =
    hasActiveMembership &&
    (currentMembership?.role === 'OWNER' ||
      currentMembership?.role === 'MEMBER');
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
    let active = true;
    setCurrentMembership(null);

    if (!homeId || !user?.id) {
      return () => {
        active = false;
      };
    }

    const loadMembership = async () => {
      try {
        const members = await listMembers(homeId);
        if (!active) return;

        const membership = members.find(
          (member) =>
            member.homeId === homeId &&
            member.userId === user?.id &&
            member.status === 'ACTIVE',
        ) ?? null;

        setCurrentMembership(membership);

        if (!membership) {
          setError(
            'No se pudo verificar tu membresía activa. El control permanecerá deshabilitado.',
          );
        }
      } catch {
        if (!active) return;
        setCurrentMembership(null);
        setError(
          'No fue posible verificar los permisos del hogar. El dispositivo permanecerá en modo de solo lectura.',
        );
      }
    };

    void loadMembership();

    return () => {
      active = false;
    };
  }, [homeId, user?.id]);

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
    if (!homeId || !device || !canControlDevice) return;

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

  const handleDeactivate = async () => {
    if (!homeId || !device || !isOwner || isDeactivating) return;
    if (!window.confirm(`¿Desactivar "${device.name}"? Podrás reactivarlo desde la lista de dispositivos inactivos.`)) return;
    setIsDeactivating(true);
    setError('');
    try {
      await deactivateDevice(homeId, device.id);
      navigate(`/homes/${homeId}/devices`, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible desactivar el dispositivo.');
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDelete = async () => {
    if (!homeId || !device || !isOwner || isDeleting) return;
    if (!window.confirm(`¿Eliminar lógicamente "${device.name}" del hogar? El dispositivo dejará de aparecer en las listas.`)) return;
    setIsDeleting(true);
    setError('');
    try {
      await deleteDevice(homeId, device.id);
      navigate(`/homes/${homeId}/devices`, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible eliminar el dispositivo.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sh-page-enter">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-gray-500 shadow-sm shadow-slate-900/5 dark:border-gray-800 dark:bg-[#151824] dark:text-gray-400">
          Cargando dispositivo...
        </div>
      </div>
    );
  }

  if (error && !device) {
    return (
      <div className="sh-page-enter">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm shadow-red-900/5 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300 sm:p-6">
          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              navigate(`/homes/${homeId}/devices`)
            }
            className="mt-3 inline-flex min-h-11 items-center rounded-lg font-semibold underline underline-offset-4 transition-colors duration-200 hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:hover:text-red-200 dark:focus-visible:ring-offset-gray-950 motion-reduce:transition-none"
          >
            Volver a dispositivos
          </button>
        </div>
      </div>
    );
  }

  if (!device) {
    return null;
  }

  return (
    <div className="min-h-full bg-[#f4f7fe] dark:bg-[#0f111a] sh-page-enter">
      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-7">

        <header>
          <button
            type="button"
            onClick={() =>
              navigate(`/homes/${homeId}/devices`)
            }
            className="mb-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#1866C1] transition-colors duration-200 hover:underline underline-offset-4 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1] focus-visible:ring-offset-4 motion-reduce:transition-none"
          >
            ← Volver a dispositivos
          </button>

          <h1 className="break-words text-2xl font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-3xl">
            {device.name}
          </h1>

          <p className="mt-1 break-words text-sm leading-6 text-gray-500 dark:text-gray-400">
            {home?.name}
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 shadow-sm shadow-amber-900/5 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300 sm:p-5"
          >
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">

          <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 dark:border-gray-800">
            <CardContent className="p-5 sm:p-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Conectividad
              </p>

              <p className={`mt-2 text-2xl font-bold tracking-tight ${
                device.connectivityStatus === 'ONLINE'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-300'
              }`}>
                {device.connectivityStatus}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 dark:border-gray-800">
            <CardContent className="p-5 sm:p-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Estado
              </p>

              <p className={`mt-2 text-2xl font-bold tracking-tight ${
                device.isOn
                  ? 'text-[#1866C1] dark:text-sky-300'
                  : 'text-[#1b254b] dark:text-white'
              }`}>
                {device.isOn ? 'Encendido' : 'Apagado'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 dark:border-gray-800">
            <CardContent className="p-5 sm:p-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Potencia actual
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-[#1b254b] dark:text-white">
                {device.currentPowerW === null
                  ? 'Sin datos'
                  : `${device.currentPowerW} W`}
              </p>
            </CardContent>
          </Card>

        </section>

        <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 dark:border-gray-800">
          <CardContent className="p-5 sm:p-6">

            <h2 className="text-lg font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-xl">
              Información del dispositivo
            </h2>

            <div className="mt-5 grid gap-x-6 gap-y-5 sm:mt-6 sm:grid-cols-2">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Nombre
                </p>

                <p className="mt-1 break-words text-sm font-medium text-[#1b254b] dark:text-white">
                  {device.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Estado del registro
                </p>

                <p className="mt-1 break-words text-sm font-medium text-[#1b254b] dark:text-white">
                  {device.status}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Identificador del fabricante
                </p>

                <p className="mt-1 break-words text-sm font-medium text-[#1b254b] dark:text-white">
                  {device.manufacturerDeviceId || 'No disponible'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Transporte
                </p>

                <p className="mt-1 break-words text-sm font-medium text-[#1b254b] dark:text-white">
                  {device.transportType || 'No disponible'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Protocolo
                </p>

                <p className="mt-1 break-words text-sm font-medium text-[#1b254b] dark:text-white">
                  {device.messagingProtocol || 'No disponible'}
                </p>
              </div>

            </div>

          </CardContent>
        </Card>

        {(canControlDevice || isOwner) && (
          <section
            className={`grid gap-4 ${isOwner ? 'sm:grid-cols-2' : 'sm:max-w-md'}`}
          >
            {canControlDevice && (
              <Button
                type="button"
                variant="primary"
                className="w-full"
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
            )}

            {isOwner && (
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() =>
                  navigate(
                    `/homes/${homeId}/devices/${device.id}/edit`,
                  )
                }
              >
                Editar dispositivo
              </Button>
            )}
          </section>
        )}

        {isOwner && (
          <section className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/50 dark:bg-rose-950/20 sm:p-5" aria-labelledby="device-management-heading">
            <h2 id="device-management-heading" className="text-sm font-semibold text-rose-800 dark:text-rose-200">Administración</h2>
            <p className="mt-1 text-sm leading-6 text-rose-700/90 dark:text-rose-300/90">Desactivar conserva la posibilidad de reactivarlo. Eliminar aplica una baja lógica en el servidor y requiere confirmación.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="secondary" className="min-h-11 w-full border-rose-200 text-rose-700 hover:bg-rose-100 dark:border-rose-900/70 dark:text-rose-300 dark:hover:bg-rose-950/40 sm:w-auto" disabled={isDeactivating || isDeleting} onClick={() => void handleDeactivate()}>
              {isDeactivating ? 'Desactivando...' : 'Desactivar dispositivo'}
            </Button>
            <Button type="button" variant="secondary" className="min-h-11 w-full border-rose-300 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-950/40 sm:w-auto" disabled={isDeactivating || isDeleting} onClick={() => void handleDelete()}>
              {isDeleting ? 'Eliminando...' : 'Eliminar del hogar'}
            </Button>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default DeviceDetailPage;
