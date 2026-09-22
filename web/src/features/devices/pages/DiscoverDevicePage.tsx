import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  discoverShellyDevices,
  identifyShellyDevice,
  provisionShellyDevice,
  type DiscoveredShellyDevice,
  type IdentifiedShellyDevice,
} from '../../../shared/api/shelly.api';

import {
  Card,
  CardContent,
} from '../../../components/ui/Card';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export const DiscoverDevicePage = () => {
  const navigate =
    useNavigate();

  const { homeId } =
    useParams<{
      homeId: string;
    }>();

  const [
    devices,
    setDevices,
  ] =
    useState<
      DiscoveredShellyDevice[]
    >([]);

  const [
    selectedDevice,
    setSelectedDevice,
  ] =
    useState<
      IdentifiedShellyDevice | null
    >(null);

  const [
    deviceName,
    setDeviceName,
  ] =
    useState('');

  const [
    isSearching,
    setIsSearching,
  ] =
    useState(false);

  const [
    isIdentifying,
    setIsIdentifying,
  ] =
    useState(false);

  const [
    isProvisioning,
    setIsProvisioning,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  const handleDiscover =
    async () => {
      if (!homeId) {
        return;
      }

      setIsSearching(true);
      setError('');

      try {
        const result =
          await discoverShellyDevices(
            homeId,
          );

        setDevices(
          result,
        );
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'No fue posible buscar dispositivos.',
        );
      } finally {
        setIsSearching(false);
      }
    };

  useEffect(() => {
    void handleDiscover();
  }, [homeId]);

  const handleSelect =
    async (
      device:
        DiscoveredShellyDevice,
    ) => {
      if (!homeId) {
        return;
      }

      setIsIdentifying(true);
      setError('');

      try {
        const identified =
          await identifyShellyDevice(
            homeId,
            device.ip,
          );

        setSelectedDevice(
          identified,
        );
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'No fue posible identificar el dispositivo.',
        );
      } finally {
        setIsIdentifying(false);
      }
    };

  const handleProvision =
    async () => {
      if (
        !homeId ||
        !selectedDevice
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

      setIsProvisioning(true);
      setError('');

      try {
        await provisionShellyDevice(
          homeId,
          {
            shellyIp:
              selectedDevice.wifiIp,

            name,
          },
        );

        navigate(
          `/homes/${homeId}/devices`,
        );
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'No fue posible vincular el dispositivo.',
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
                `/homes/${homeId}/devices/add`,
              )
            }
            className="mb-3 text-sm font-semibold text-[#1866C1] hover:underline"
          >
            ← Volver
          </button>

          <h1 className="text-3xl font-bold text-[#1b254b] dark:text-white">
            Buscar dispositivos
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            SmartHome buscará
            dispositivos compatibles
            conectados a tu red.
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!selectedDevice && (
          <Card>
            <CardContent className="p-6">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <h2 className="font-semibold text-[#1b254b] dark:text-white">
                    Dispositivos encontrados
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Selecciona el dispositivo
                    que deseas vincular.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  disabled={
                    isSearching
                  }
                  onClick={() =>
                    void handleDiscover()
                  }
                >
                  {isSearching
                    ? 'Buscando...'
                    : 'Buscar nuevamente'}
                </Button>

              </div>

              {isSearching && (
                <p className="mt-6 text-sm text-gray-500">
                  Buscando dispositivos...
                </p>
              )}

              {!isSearching &&
                devices.length ===
                  0 && (
                  <div className="mt-6 rounded-xl bg-gray-50 p-5 text-sm text-gray-500 dark:bg-gray-900">
                    No encontramos
                    dispositivos compatibles.
                  </div>
                )}

              <div className="mt-6 space-y-3">

                {devices.map(
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
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        disabled={
                          isIdentifying
                        }
                        onClick={() =>
                          void handleSelect(
                            device,
                          )
                        }
                      >
                        {isIdentifying
                          ? 'Comprobando...'
                          : 'Seleccionar'}
                      </Button>

                    </div>
                  ),
                )}

              </div>

            </CardContent>
          </Card>
        )}

        {selectedDevice && (
          <Card>
            <CardContent className="p-6">

              <h2 className="text-xl font-semibold text-[#1b254b] dark:text-white">
                Dispositivo encontrado
              </h2>

              <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-900">

                <p className="font-semibold text-[#1b254b] dark:text-white">
                  {
                    selectedDevice.model
                  }
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  IP:{' '}
                  {
                    selectedDevice.wifiIp
                  }
                </p>

              </div>

              <div className="mt-6">
                <Input
                  label="Nombre del dispositivo"
                  type="text"
                  placeholder="Ej. Lámpara sala"
                  value={
                    deviceName
                  }
                  onChange={(
                    event,
                  ) =>
                    setDeviceName(
                      event.target.value,
                    )
                  }
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Elige un nombre que te
                permita reconocer fácilmente
                este dispositivo.
              </p>

              <div className="mt-6 flex gap-3">

                <Button
                  type="button"
                  variant="primary"
                  disabled={
                    isProvisioning
                  }
                  onClick={() =>
                    void handleProvision()
                  }
                >
                  {isProvisioning
                    ? 'Vinculando...'
                    : 'Vincular dispositivo'}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  disabled={
                    isProvisioning
                  }
                  onClick={() => {
                    setSelectedDevice(
                      null,
                    );

                    setDeviceName(
                      '',
                    );
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