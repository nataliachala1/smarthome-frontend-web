import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  controlDevice,
  listDevices,
  type Device,
} from '../../../shared/api/devices.api';

import {
  getHome,
  listMembers,
  type Home,
  type HomeMember,
} from '../../../shared/api/homes.api';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

import {
  Card,
  CardContent,
} from '../../../components/ui/Card';

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

export const Devices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { homeId } =
    useParams<{
      homeId: string;
    }>();

  const [
    home,
    setHome,
  ] =
    useState<Home | null>(
      null,
    );

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

  const [
    devices,
    setDevices,
  ] =
    useState<Device[]>([]);

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState('');

  const [pendingDeviceIds, setPendingDeviceIds] = useState<Set<string>>(
    new Set(),
  );


  /*
   * Cargar hogar + dispositivos
   */
  const loadDevicesPage =
    useCallback(
      async () => {
        setCurrentMembership(null);

        if (!homeId) {
          setError(
            'No se encontrÃƒÂ³ el hogar seleccionado.',
          );

          setIsLoading(
            false,
          );

          return;
        }

        setIsLoading(
          true,
        );

        setError('');

        try {
          const [
            homeResponse,
            devicesResponse,
          ] =
            await Promise.all([
              getHome(
                homeId,
              ),

              listDevices(
                homeId,
              ),
            ]);

          setHome(
            homeResponse,
          );

          setDevices(
            devicesResponse,
          );

          try {
            const membersResponse = await listMembers(homeId);
            const membership = membersResponse.find(
              (member) =>
                member.homeId === homeId &&
                member.userId === user?.id &&
                member.status === 'ACTIVE',
            ) ?? null;

            setCurrentMembership(membership);

            if (!membership) {
              setError(
                'No se pudo verificar tu membresÃƒÂ­a activa. Los controles permanecerÃƒÂ¡n deshabilitados.',
              );
            }
          } catch {
            setCurrentMembership(null);
            setError(
              'No fue posible verificar los permisos del hogar. Los dispositivos permanecerÃƒÂ¡n en modo de solo lectura.',
            );
          }

          localStorage.setItem(
            'activeHomeId',
            homeId,
          );
        } catch (cause) {
          setError(
            cause instanceof Error
              ? cause.message
              : 'No fue posible cargar los dispositivos.',
          );
        } finally {
          setIsLoading(
            false,
          );
        }
      },
      [homeId, user?.id],
    );

  /*
   * Carga inicial
   */
  useEffect(() => {
    void loadDevicesPage();
  }, [loadDevicesPage]);

  /*
   * Actualizaciones en tiempo real
   */
  useEffect(() => {
    const socket =
      getRealtimeSocket();

    if (
      !socket ||
      !homeId
    ) {
      return;
    }

    const handleConnected = (
      payload: {
        userId: string;
      },
    ) => {
      console.log(
        'Realtime conectado:',
        payload,
      );
    };

    const handleRealtimeError = (
      payload: {
        message: string;
      },
    ) => {
      console.error(
        'Realtime error:',
        payload,
      );
    };

    const handleDeviceStatusUpdated = (
      payload:
        DeviceStatusUpdatedEvent,
    ) => {
      if (
        payload.homeId !==
        homeId
      ) {
        return;
      }

      setDevices(
        (
          currentDevices,
        ) =>
          currentDevices.map(
            (device) =>
              device.id ===
              payload.id
                ? {
                    ...device,

                    connectivityStatus:
                      payload.connectivityStatus,

                    isOn:
                      payload.isOn,

                    currentPowerW:
                      payload.currentPowerW,

                    updatedAt:
                      payload.updatedAt,
                  }
                : device,
          ),
      );
    };

    socket.on(
      'realtime.connected',
      handleConnected,
    );

    socket.on(
      'realtime.error',
      handleRealtimeError,
    );

    socket.on(
      'device.status.updated',
      handleDeviceStatusUpdated,
    );

    return () => {
      socket.off(
        'realtime.connected',
        handleConnected,
      );

      socket.off(
        'realtime.error',
        handleRealtimeError,
      );

      socket.off(
        'device.status.updated',
        handleDeviceStatusUpdated,
      );
    };
  }, [homeId]);

  /*
   * Buscador
   */
  const filteredDevices =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      if (!term) {
        return devices;
      }

      return devices.filter(
        (device) =>
          device.name
            .toLowerCase()
            .includes(
              term,
            ),
      );
    }, [
      devices,
      search,
    ]);

  /*
   * EstadÃƒÂ­sticas
   */
  const onlineCount =
    devices.filter(
      (device) =>
        device.connectivityStatus ===
        'ONLINE',
    ).length;

  const offlineCount =
    devices.filter(
      (device) =>
        device.connectivityStatus ===
        'OFFLINE',
    ).length;

  const onCount =
    devices.filter(
      (device) =>
        device.isOn,
    ).length;

  /*
   * Encender / apagar dispositivos
   */
  const handleControlDevice = async (device: Device) => {
    if (!homeId || !canControlDevice) {
      return;
    }

    if (device.connectivityStatus !== 'ONLINE') {
      setError(
        'El dispositivo estÃƒÂ¡ desconectado y no puede recibir ÃƒÂ³rdenes.',
      );
      return;
    }

    if (pendingDeviceIds.has(device.id)) {
      return;
    }

    const command = device.isOn ? 'TURN_OFF' : 'TURN_ON';

    setPendingDeviceIds((current) => {
      const next = new Set(current);
      next.add(device.id);
      return next;
    });

    setError('');

    try {
      const response = await controlDevice(homeId, device.id, command);

      if (response.status !== 'COMMAND_PUBLISHED') {
        setError('No se pudo confirmar la publicaciÃƒÂ³n de la orden.');
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible enviar la orden al dispositivo.',
      );
    } finally {
      setPendingDeviceIds((current) => {
        const next = new Set(current);
        next.delete(device.id);
        return next;
      });
    }
  };


  /*
   * Loading
   */
  if (isLoading) {
    return (
      <main className="p-6">
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
          Cargando dispositivos...
        </div>
      </main>
    );
  }

  /*
   * Error que impide cargar
   * completamente el hogar
   */
  if (
    error &&
    !home
  ) {
    return (
      <main className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">

          <p>
            {error}
          </p>

          <Button
            type="button"
            variant="secondary"
            className="mt-4"
            onClick={() =>
              navigate(
                '/homes',
              )
            }
          >
            Volver a Mis hogares
          </Button>

        </div>
      </main>
    );
  }

  /*
   * Pantalla normal
   */
  return (
    <main className="min-h-screen bg-[#f4f7fe] p-6 dark:bg-[#0f111a]">

      <div className="mx-auto max-w-7xl space-y-7">

        {/* ================================= */}
        {/* HEADER                            */}
        {/* ================================= */}

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/homes/${homeId}/dashboard`,
                )
              }
              className="mb-3 text-sm font-semibold text-[#1866C1] hover:underline"
            >
              Ã¢â€ Â Volver al hogar
            </button>

            <h1 className="text-3xl font-bold text-[#1b254b] dark:text-white">
              Dispositivos
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {home?.name}
            </p>

          </div>
          {isOwner && (
            <Button
              type="button"
              variant="primary"
              onClick={() =>
                navigate(
                  `/homes/${homeId}/devices/add`,
                    )
              }
            >
              + Agregar dispositivo
            </Button>
          )}

        </header>

        {/* ================================= */}
        {/* ERROR NO BLOQUEANTE               */}
        {/* ================================= */}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300"
          >
            {error}
          </div>
        )}

        {/* ================================= */}
        {/* RESUMEN                           */}
        {/* ================================= */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">

            <CardContent className="p-5">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total
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
                {onlineCount}
              </p>

            </CardContent>

          </Card>

          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">

            <CardContent className="p-5">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Offline
              </p>

              <p className="mt-2 text-3xl font-bold text-[#1b254b] dark:text-white">
                {offlineCount}
              </p>

            </CardContent>

          </Card>

          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">

            <CardContent className="p-5">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Encendidos
              </p>

              <p className="mt-2 text-3xl font-bold text-[#1b254b] dark:text-white">
                {onCount}
              </p>

            </CardContent>

          </Card>

        </section>

        {/* ================================= */}
        {/* LISTADO                           */}
        {/* ================================= */}

        <section>

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <h2 className="text-xl font-bold text-[#1b254b] dark:text-white">
              Dispositivos del hogar
            </h2>

            <div className="w-full sm:w-72">

              <Input
                label=""
                type="text"
                placeholder="Buscar dispositivo..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
              />

            </div>

          </div>

          {filteredDevices.length ===
          0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-[#151824]">

              <p className="font-semibold text-[#1b254b] dark:text-white">
                No hay dispositivos
              </p>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Agrega tu primer dispositivo
                para comenzar a controlarlo
                desde SmartHome.
              </p>
              {isOwner && (
                <Button
                  type="button"
                  variant="primary"
                  className="mt-5"
                  onClick={() =>
                    navigate(
                      `/homes/${homeId}/devices/add`,
                    )
                  }
                >
                  + Agregar dispositivo
                </Button>
              )}

            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredDevices.map(
                (device) => (
                  <Card
                    key={
                      device.id
                    }
                    className="rounded-2xl border border-gray-100 dark:border-gray-800"
                  >

                    <CardContent className="p-6">

                      <div className="flex items-start justify-between gap-3">

                        <div>

                          <h3 className="text-lg font-semibold text-[#1b254b] dark:text-white">
                            {
                              device.name
                            }
                          </h3>

                          <span
                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                              device.connectivityStatus ===
                              'ONLINE'
                                ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {
                              device.connectivityStatus
                            }
                          </span>

                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            device.isOn
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {device.isOn
                            ? 'Encendido'
                            : 'Apagado'}
                        </span>

                      </div>

                      <div className="mt-5 space-y-2 text-sm text-gray-500 dark:text-gray-400">

                        <p>
                          Potencia actual:{' '}

                          <span className="font-semibold text-[#1b254b] dark:text-white">
                            {device.currentPowerW ??
                              0}{' '}
                            W
                          </span>
                        </p>

                      </div>

                      <div className="mt-6 space-y-3">
                        {canControlDevice && (

                          <Button
                            type="button"
                            variant="primary"
                            className="w-full"
                            disabled={
                              device.connectivityStatus !== 'ONLINE' ||
                              pendingDeviceIds.has(device.id)
                            }
                            onClick={() =>
                              void handleControlDevice(device)
                            }
                          >
                            {pendingDeviceIds.has(device.id)
                              ? 'Enviando orden...'
                              : device.isOn
                                ? 'Apagar'
                                : 'Encender'}
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full"
                          onClick={() =>
                            navigate(
                              `/homes/${homeId}/devices/${device.id}`,
                            )
                          }
                        >
                          Ver detalle
                        </Button>

                      </div>

                    </CardContent>

                  </Card>
                ),
              )}

            </div>
          )}

        </section>

      </div>

    </main>
  );
};

export default Devices;
