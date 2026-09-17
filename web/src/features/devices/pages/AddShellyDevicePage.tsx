import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  listDeviceTypes,
  type DeviceType,
} from '../../../shared/api/devices.api';

import {
  discoverShellyDevices,
  identifyShellyDevice,
  provisionShellyDevice,
  type DiscoveredShellyDevice,
  type IdentifiedShellyDevice,
} from '../../../shared/api/shelly.api';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

import {
  Card,
  CardContent,
} from '../../../components/ui/Card';

export const AddShellyDevicePage = () => {
  const navigate = useNavigate();

  const { homeId } =
    useParams<{ homeId: string }>();

  const [
    discoveredDevices,
    setDiscoveredDevices,
  ] = useState<
    DiscoveredShellyDevice[]
  >([]);

  const [
    identifiedDevice,
    setIdentifiedDevice,
  ] = useState<
    IdentifiedShellyDevice | null
  >(null);

  const [
    deviceTypes,
    setDeviceTypes,
  ] = useState<DeviceType[]>([]);

  const [
    manualIp,
    setManualIp,
  ] = useState('');

  const [
    deviceName,
    setDeviceName,
  ] = useState('');

  const [
    deviceTypeId,
    setDeviceTypeId,
  ] = useState('');

  const [
    isSearching,
    setIsSearching,
  ] = useState(false);

  const [
    isIdentifying,
    setIsIdentifying,
  ] = useState(false);

  const [
    isProvisioning,
    setIsProvisioning,
  ] = useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const handleDiscover = async () => {
    if (!homeId) return;

    setIsSearching(true);
    setError('');

    try {
      const devices =
        await discoverShellyDevices(
          homeId,
        );

      setDiscoveredDevices(devices);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible buscar dispositivos Shelly.',
      );
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!homeId) return;

    void handleDiscover();

    void (async () => {
      try {
        const types =
          await listDeviceTypes();

        setDeviceTypes(types);

        setDeviceTypeId(
          types[0]?.id ?? '',
        );
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'No fue posible cargar los tipos de dispositivo.',
        );
      }
    })();
  }, [homeId]);

  const handleIdentify = async (
    ip: string,
  ) => {
    if (!homeId) return;

    const normalizedIp = ip.trim();

    if (!normalizedIp) {
      setError(
        'Debes ingresar una dirección IP.',
      );
      return;
    }

    setIsIdentifying(true);
    setError('');
    setSuccess('');

    try {
      const device =
        await identifyShellyDevice(
          homeId,
          normalizedIp,
        );

      setIdentifiedDevice(device);
      setManualIp(device.wifiIp);
    } catch (cause) {
      setIdentifiedDevice(null);

      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible identificar el Shelly.',
      );
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleProvision = async () => {
    if (
      !homeId ||
      !identifiedDevice
    ) {
      return;
    }

    const name =
      deviceName.trim();

    if (!name) {
      setError(
        'Debes asignar un nombre al dispositivo.',
      );
      return;
    }

    if (!deviceTypeId) {
      setError(
        'Debes seleccionar un tipo de dispositivo.',
      );
      return;
    }

    setIsProvisioning(true);
    setError('');
    setSuccess('');

    try {
      const result =
        await provisionShellyDevice(
          homeId,
          {
            shellyIp:
              identifiedDevice.wifiIp,

            name,

            deviceTypeId,
          },
        );

      setSuccess(result.message);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible vincular el Shelly.',
      );
    } finally {
      setIsProvisioning(false);
    }
  };

  if (!homeId) {
    return (
      <main className="p-6">
        <p>
          No se encontró el hogar.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fe] p-6 dark:bg-[#0f111a]">
      <div className="mx-auto max-w-4xl space-y-6">

        <header>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/homes/${homeId}/devices`,
              )
            }
            className="mb-3 text-sm font-semibold text-[#1866C1] hover:underline"
          >
            ← Volver a dispositivos
          </button>

          <h1 className="text-3xl font-bold text-[#1b254b] dark:text-white">
            Vincular Shelly 1PM Gen4
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            SmartHome buscará el dispositivo en
            tu red local. También puedes ingresar
            la IP manualmente.
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/20 dark:text-green-300">
            <p>{success}</p>

            <Button
              type="button"
              variant="primary"
              className="mt-4"
              onClick={() =>
                navigate(
                  `/homes/${homeId}/devices`,
                )
              }
            >
              Ver dispositivos
            </Button>
          </div>
        )}

        {!identifiedDevice &&
          !success && (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-[#1b254b] dark:text-white">
                        Buscar automáticamente
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Buscando Shelly 1PM Gen4
                        disponibles en la red.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      disabled={isSearching}
                      onClick={() =>
                        void handleDiscover()
                      }
                    >
                      {isSearching
                        ? 'Buscando...'
                        : 'Buscar'}
                    </Button>
                  </div>

                  {!isSearching &&
                    discoveredDevices.length ===
                      0 && (
                      <p className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-900">
                        No se encontraron
                        dispositivos automáticamente.
                      </p>
                    )}

                  <div className="mt-5 space-y-3">
                    {discoveredDevices.map(
                      (device) => (
                        <div
                          key={
                            device.manufacturerDeviceId
                          }
                          className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700"
                        >
                          <div>
                            <p className="font-semibold text-[#1b254b] dark:text-white">
                              {device.model}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              IP: {device.ip}
                            </p>

                            <p className="text-sm text-gray-500">
                              MAC: {device.mac}
                            </p>

                            <p className="text-xs text-gray-400">
                              {
                                device.manufacturerDeviceId
                              }
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="primary"
                            disabled={
                              isIdentifying
                            }
                            onClick={() =>
                              void handleIdentify(
                                device.ip,
                              )
                            }
                          >
                            Seleccionar
                          </Button>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-[#1b254b] dark:text-white">
                    Ingresar IP manualmente
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Utiliza esta opción si el
                    Shelly no aparece en la búsqueda.
                  </p>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <Input
                        label="IP del Shelly"
                        type="text"
                        placeholder="10.3.234.97"
                        value={manualIp}
                        onChange={(event) =>
                          setManualIp(
                            event.target.value,
                          )
                        }
                      />
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      disabled={isIdentifying}
                      onClick={() =>
                        void handleIdentify(
                          manualIp,
                        )
                      }
                    >
                      {isIdentifying
                        ? 'Identificando...'
                        : 'Identificar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

        {identifiedDevice &&
          !success && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#1b254b] dark:text-white">
                  Shelly identificado
                </h2>

                <div className="mt-5 grid gap-3 rounded-xl bg-gray-50 p-5 text-sm dark:bg-gray-900">
                  <p>
                    <strong>Modelo:</strong>{' '}
                    {identifiedDevice.model}
                  </p>

                  <p>
                    <strong>IP:</strong>{' '}
                    {
                      identifiedDevice.wifiIp
                    }
                  </p>

                  <p>
                    <strong>MAC:</strong>{' '}
                    {identifiedDevice.mac}
                  </p>

                  <p>
                    <strong>
                      Identificador:
                    </strong>{' '}
                    {
                      identifiedDevice.manufacturerDeviceId
                    }
                  </p>

                  <p>
                    <strong>Firmware:</strong>{' '}
                    {identifiedDevice.firmwareVersion ??
                      'No disponible'}
                  </p>

                  <p>
                    <strong>MQTT:</strong>{' '}
                    {identifiedDevice.mqttConnected ===
                    true
                      ? 'Conectado'
                      : 'No conectado'}
                  </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Input
                    label="Nombre del dispositivo"
                    type="text"
                    placeholder="Lámpara sala"
                    value={deviceName}
                    onChange={(event) =>
                      setDeviceName(
                        event.target.value,
                      )
                    }
                  />

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo de dispositivo
                    </label>

                    <select
                      value={deviceTypeId}
                      onChange={(event) =>
                        setDeviceTypeId(
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-gray-700 dark:bg-[#151824]"
                    >
                      {deviceTypes.map(
                        (type) => (
                          <option
                            key={type.id}
                            value={type.id}
                          >
                            {type.name}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={isProvisioning}
                    onClick={() =>
                      void handleProvision()
                    }
                  >
                    {isProvisioning
                      ? 'Configurando Shelly...'
                      : 'Vincular dispositivo'}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isProvisioning}
                    onClick={() => {
                      setIdentifiedDevice(
                        null,
                      );

                      setDeviceName('');
                      setError('');
                    }}
                  >
                    Volver
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </main>
  );
};