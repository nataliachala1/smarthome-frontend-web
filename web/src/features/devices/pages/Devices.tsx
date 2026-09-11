import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  controlDevice,
  createDevice,
  listDevices,
  listDeviceTypes,
  type Device,
  type DeviceType,
} from '../../../shared/api/devices.api';
import { getHome, type Home } from '../../../shared/api/homes.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
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

export const Devices = () => {
  const navigate = useNavigate();
  const { homeId } = useParams<{ homeId: string }>();

  const [home, setHome] = useState<Home | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);

  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newName, setNewName] = useState('');
  const [newDeviceTypeId, setNewDeviceTypeId] = useState('');
  const [manufacturerDeviceId, setManufacturerDeviceId] = useState('');

  const loadDevicesPage = useCallback(async () => {
    if (!homeId) {
      setError('No se encontró el hogar seleccionado.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const [homeResponse, devicesResponse, typesResponse] =
        await Promise.all([
          getHome(homeId),
          listDevices(homeId),
          listDeviceTypes(),
        ]);

      setHome(homeResponse);
      setDevices(devicesResponse);
      setDeviceTypes(typesResponse);

      setNewDeviceTypeId((current) =>
        current || typesResponse[0]?.id || '',
      );

      localStorage.setItem('activeHomeId', homeId);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible cargar los dispositivos.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [homeId]);

  useEffect(() => {
    void loadDevicesPage();
  }, [loadDevicesPage]);

  useEffect(() => {
    const socket = getRealtimeSocket();

    if (!socket || !homeId) {
      return;
    }

    const handleConnected = (payload: { userId: string }) => {
      console.log('Realtime conectado:', payload);
    };

    const handleRealtimeError = (payload: { message: string }) => {
      console.error('Realtime error:', payload);
    };

    const handleDeviceStatusUpdated = (
      payload: DeviceStatusUpdatedEvent,
    ) => {
      console.log('device.status.updated recibido:', payload);

      if (payload.homeId !== homeId) {
        return;
      }

      setDevices((currentDevices) =>
        currentDevices.map((device) =>
          device.id === payload.id
            ? {
                ...device,
                connectivityStatus: payload.connectivityStatus,
                isOn: payload.isOn,
                currentPowerW: payload.currentPowerW,
                updatedAt: payload.updatedAt,
              }
            : device,
        ),
      );
    };

    socket.on('realtime.connected', handleConnected);
    socket.on('realtime.error', handleRealtimeError);
    socket.on('device.status.updated', handleDeviceStatusUpdated);

    return () => {
      socket.off('realtime.connected', handleConnected);
      socket.off('realtime.error', handleRealtimeError);
      socket.off('device.status.updated', handleDeviceStatusUpdated);
    };
  }, [homeId]);

  const filteredDevices = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return devices;
    }

    return devices.filter((device) =>
      device.name.toLowerCase().includes(term),
    );
  }, [devices, search]);

  const onlineCount = devices.filter(
    (device) => device.connectivityStatus === 'ONLINE',
  ).length;

  const offlineCount = devices.filter(
    (device) => device.connectivityStatus === 'OFFLINE',
  ).length;

  const onCount = devices.filter(
    (device) => device.isOn,
  ).length;

  const handleCreateDevice = async () => {
    if (!homeId) return;

    const name = newName.trim();

    if (!name || !newDeviceTypeId) {
      setError(
        'Debes ingresar el nombre y seleccionar un tipo de dispositivo.',
      );
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await createDevice(homeId, {
        deviceTypeId: newDeviceTypeId,
        name,
        manufacturerDeviceId:
          manufacturerDeviceId.trim() || undefined,
        transportType: 'WIFI',
        messagingProtocol: 'MQTT',
      });

      setNewName('');
      setManufacturerDeviceId('');
      setIsCreating(false);

      await loadDevicesPage();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible registrar el dispositivo.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleControlDevice = async (device: Device) => {
    if (!homeId) return;

    setError('');

    try {
      await controlDevice(
        homeId,
        device.id,
        device.isOn ? 'TURN_OFF' : 'TURN_ON',
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible controlar el dispositivo.',
      );
    }
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
          Cargando dispositivos...
        </div>
      </main>
    );
  }

  if (error && !home) {
    return (
      <main className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="mt-3 font-semibold underline"
          >
            Volver al Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fe] p-6 dark:bg-[#0f111a]">
      <div className="mx-auto max-w-7xl space-y-7">

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate(`/homes/${homeId}/dashboard`)
              }
              className="mb-3 text-sm font-semibold text-[#1866C1] hover:underline"
            >
              ← Volver al hogar
            </button>

            <h1 className="text-3xl font-bold text-[#1b254b] dark:text-white">
              Dispositivos
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {home?.name}
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setIsCreating((current) => !current);
              setError('');
            }}
          >
            + Agregar dispositivo
          </Button>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300"
          >
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">
                Total
              </p>

              <p className="mt-2 text-3xl font-bold text-[#1b254b] dark:text-white">
                {devices.length}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">
                Online
              </p>

              <p className="mt-2 text-3xl font-bold text-[#1b254b] dark:text-white">
                {onlineCount}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">
                Offline
              </p>

              <p className="mt-2 text-3xl font-bold text-[#1b254b] dark:text-white">
                {offlineCount}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <CardContent className="p-5">
              <p className="text-sm text-gray-500">
                Encendidos
              </p>

              <p className="mt-2 text-3xl font-bold text-[#1b254b] dark:text-white">
                {onCount}
              </p>
            </CardContent>
          </Card>

        </section>

        {isCreating && (
          <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <CardContent className="p-6">

              <h2 className="text-lg font-semibold text-[#1b254b] dark:text-white">
                Registrar dispositivo
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                <Input
                  label="Nombre del dispositivo"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tipo de dispositivo
                  </label>

                  <select
                    value={newDeviceTypeId}
                    onChange={(e) =>
                      setNewDeviceTypeId(e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-gray-700 dark:bg-[#151824]"
                  >
                    {deviceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Identificador del fabricante"
                  type="text"
                  value={manufacturerDeviceId}
                  onChange={(e) =>
                    setManufacturerDeviceId(e.target.value)
                  }
                />

              </div>

              <div className="mt-5 flex gap-3">
                <Button
                  type="button"
                  variant="primary"
                  disabled={isSaving}
                  onClick={() => void handleCreateDevice()}
                >
                  {isSaving
                    ? 'Guardando...'
                    : 'Registrar dispositivo'}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSaving}
                  onClick={() => {
                    setIsCreating(false);
                    setNewName('');
                    setManufacturerDeviceId('');
                  }}
                >
                  Cancelar
                </Button>
              </div>

            </CardContent>
          </Card>
        )}

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
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

          </div>

          {filteredDevices.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
              No se encontraron dispositivos.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {filteredDevices.map((device) => (
                <Card
                  key={device.id}
                  className="rounded-2xl border border-gray-100 dark:border-gray-800"
                >
                  <CardContent className="p-6">

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <h3 className="text-lg font-semibold text-[#1b254b] dark:text-white">
                          {device.name}
                        </h3>

                        <span
                          className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            device.connectivityStatus === 'ONLINE'
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {device.connectivityStatus}
                        </span>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          device.isOn
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {device.isOn ? 'Encendido' : 'Apagado'}
                      </span>

                    </div>

                    <div className="mt-5 space-y-2 text-sm text-gray-500 dark:text-gray-400">

                      <p>
                        Potencia actual:{' '}
                        <span className="font-semibold text-[#1b254b] dark:text-white">
                          {device.currentPowerW ?? 0} W
                        </span>
                      </p>

                      {device.manufacturerDeviceId && (
                        <p>
                          Identificador:{' '}
                          <span className="font-medium text-[#1b254b] dark:text-white">
                            {device.manufacturerDeviceId}
                          </span>
                        </p>
                      )}

                    </div>

                    <div className="mt-6 space-y-3">

                      <Button
                        type="button"
                        variant="primary"
                        className="w-full"
                        disabled={
                          device.connectivityStatus !== 'ONLINE'
                        }
                        onClick={() =>
                          void handleControlDevice(device)
                        }
                      >
                        {device.isOn
                          ? 'Apagar'
                          : 'Encender'}
                      </Button>

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
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
};

export default Devices;