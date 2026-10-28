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
import {
  getHome,
  listMembers,
  type HomeMember,
} from '../../../shared/api/homes.api';
import { useAuth } from '../../../app/contexts/AuthContext';

export const DiscoverDevicePage = () => {
  const { user } = useAuth();

  const navigate =
    useNavigate();

  const { homeId } =
    useParams<{
      homeId: string;
    }>();

  const [currentMembership, setCurrentMembership] =
    useState<HomeMember | null>(null);
  const [isLoadingHome, setIsLoadingHome] = useState(true);

  const isOwner =
    currentMembership?.homeId === homeId &&
    currentMembership?.userId === user?.id &&
    currentMembership?.status === 'ACTIVE' &&
    currentMembership?.role === 'OWNER';

  useEffect(() => {
    let active = true;

    setCurrentMembership(null);
    setIsLoadingHome(true);
    setError('');

    const loadHome = async () => {
      if (!homeId || !user?.id) {
        if (active) {
          setError('No se pudo verificar el hogar o el usuario.');
          setIsLoadingHome(false);
        }
        return;
      }

      try {
        await getHome(homeId);
        const members = await listMembers(homeId);

        if (!active) return;

        const membership = members.find(
          (member) =>
            member.homeId === homeId &&
            member.userId === user.id &&
            member.status === 'ACTIVE'
        );

        if (!membership) {
          setError('No tienes una membresía activa en este hogar.');
          setCurrentMembership(null);
          return;
        }

        setCurrentMembership(membership);

        if (membership.role !== 'OWNER') {
          setError('Solo el propietario puede descubrir y registrar dispositivos.');
        }
      } catch {
        if (active) {
          setCurrentMembership(null);
          setError('No fue posible verificar tus permisos. Inténtalo nuevamente.');
        }
      } finally {
        if (active) {
          setIsLoadingHome(false);
        }
      }
    };

    void loadHome();

    return () => {
      active = false;
    };
  }, [homeId, user?.id]);

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
      if (!homeId || !isOwner) {
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
    if (isOwner) {
      void handleDiscover();
    }
  }, [homeId, isOwner]);

  const handleSelect =
    async (
      device:
        DiscoveredShellyDevice,
    ) => {
      if (!homeId || !isOwner) {
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
      if (!homeId || !isOwner || !selectedDevice) {
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
      <div className="p-6 sh-page-enter">
        <p>
          No se encontró el hogar.
        </p>
      </div>
    );
  }

  if (isLoadingHome) {
    return (
      <div className="p-6 sh-page-enter">
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 dark:bg-[#151824] dark:text-gray-400">
          Verificando permisos...
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="p-6 sh-page-enter">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          No tienes permisos para agregar dispositivos a este hogar.
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-full bg-[#f4f7fe] p-6 dark:bg-[#0f111a] sh-page-enter">
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
    </div>
  );
};
