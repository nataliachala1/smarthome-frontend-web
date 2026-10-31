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
      <div className="sh-page-enter">
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-800 shadow-sm shadow-amber-900/5 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
          No se encontró el hogar.
        </p>
      </div>
    );
  }

  if (isLoadingHome) {
    return (
      <div className="sh-page-enter">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-gray-500 shadow-sm shadow-slate-900/5 dark:border-gray-800 dark:bg-[#151824] dark:text-gray-400">
          Verificando permisos...
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="sh-page-enter">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700 shadow-sm shadow-red-900/5 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300 sm:p-6">
          No tienes permisos para agregar dispositivos a este hogar.
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-full bg-[#f4f7fe] dark:bg-[#0f111a] sh-page-enter">
      <div className="mx-auto max-w-4xl space-y-6">

        <header>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/homes/${homeId}/devices/add`,
              )
            }
            className="mb-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#1866C1] transition-colors duration-200 hover:underline underline-offset-4 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1] focus-visible:ring-offset-4 motion-reduce:transition-none"
          >
            ← Volver
          </button>

          <h1 className="text-2xl font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-3xl">
            Buscar dispositivos
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            SmartHome buscará
            dispositivos compatibles
            conectados a tu red.
          </p>
        </header>

        {error && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 shadow-sm shadow-red-900/5 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300 sm:p-5">
            {error}
          </div>
        )}

        {!selectedDevice && (
          <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 dark:border-gray-800">
            <CardContent className="p-5 sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="font-semibold tracking-tight text-[#1b254b] dark:text-white">
                    Dispositivos encontrados
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    Selecciona el dispositivo
                    que deseas vincular.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
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
                <p role="status" className="mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200">
                  Buscando dispositivos...
                </p>
              )}

              {!isSearching &&
                devices.length ===
                  0 && (
                  <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                    No encontramos
                    dispositivos compatibles.
                  </div>
                )}

              <div className={devices.length > 0 ? 'mt-6 space-y-3' : 'hidden'}>

                {devices.map(
                  (device) => (
                    <div
                      key={
                        device.manufacturerDeviceId
                      }
                      className="flex min-w-0 flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-4 transition-[border-color,box-shadow] duration-200 hover:border-blue-200 hover:shadow-sm motion-reduce:transition-none sm:flex-row sm:items-center sm:justify-between dark:border-gray-700 dark:bg-[#151824] dark:hover:border-blue-900"
                    >

                      <div className="min-w-0">
                        <p className="break-words font-semibold tracking-tight text-[#1b254b] dark:text-white">
                          {device.model}
                        </p>

                        <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
                          IP: {device.ip}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        className="w-full sm:w-auto"
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
          <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 dark:border-gray-800">
            <CardContent className="p-5 sm:p-6">

              <h2 className="text-lg font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-xl">
                Dispositivo encontrado
              </h2>

              <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900">

                <p className="break-words font-semibold tracking-tight text-[#1b254b] dark:text-white">
                  {
                    selectedDevice.model
                  }
                </p>

                <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
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

              <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                Elige un nombre que te
                permita reconocer fácilmente
                este dispositivo.
              </p>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-gray-800 sm:flex-row">

                <Button
                  type="button"
                  variant="primary"
                  className="w-full sm:w-auto"
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
                  className="w-full sm:w-auto"
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
