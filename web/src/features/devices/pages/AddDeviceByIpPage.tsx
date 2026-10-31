import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  identifyShellyDevice,
  provisionShellyDevice,
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

export const AddDeviceByIpPage = () => {
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

    setIsLoadingHome(true);
    setCurrentMembership(null);
    setError('');

    if (!homeId || !user?.id) {
      setIsLoadingHome(false);
      return () => {
        active = false;
      };
    }

    const loadHome = async () => {
      try {
        await getHome(homeId);
        const members = await listMembers(homeId);

        if (!active) return;

        const membership = members.find(
          (member) =>
            member.homeId === homeId &&
            member.userId === user.id &&
            member.status === 'ACTIVE',
        ) ?? null;

        setCurrentMembership(membership);

        if (!membership) {
          setError('No se pudo verificar tu membresía activa.');
        }
      } catch (cause) {
        if (!active) return;

        setCurrentMembership(null);
        setError(
          cause instanceof Error
            ? cause.message
            : 'No fue posible verificar los permisos del hogar.',
        );
      } finally {
        if (active) setIsLoadingHome(false);
      }
    };

    void loadHome();

    return () => {
      active = false;
    };
  }, [homeId, user?.id]);

  const [
    ip,
    setIp,
  ] =
    useState('');

  const [
    deviceName,
    setDeviceName,
  ] =
    useState('');

  const [
    identifiedDevice,
    setIdentifiedDevice,
  ] =
    useState<
      IdentifiedShellyDevice | null
    >(null);

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

  const handleIdentify =
    async () => {
      if (!homeId || !isOwner) {
        return;
      }

      const normalizedIp =
        ip.trim();

      if (!normalizedIp) {
        setError(
          'Debes ingresar la dirección IP del dispositivo.',
        );

        return;
      }

      setIsIdentifying(true);
      setError('');

      try {
        const device =
          await identifyShellyDevice(
            homeId,
            normalizedIp,
          );

        setIdentifiedDevice(
          device,
        );

        setIp(
          device.wifiIp,
        );
      } catch (cause) {
        setIdentifiedDevice(
          null,
        );

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
      if (!homeId || !isOwner || !identifiedDevice) {
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
              identifiedDevice.wifiIp,

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
      <div className="mx-auto max-w-2xl space-y-6">

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
            Agregar por IP
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            Ingresa la dirección IP
            del dispositivo conectado
            a tu red.
          </p>
        </header>

        {error && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 shadow-sm shadow-red-900/5 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300 sm:p-5">
            {error}
          </div>
        )}

        {!identifiedDevice && (
          <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 dark:border-gray-800">
            <CardContent className="p-5 sm:p-6">

              <Input
                label="Dirección IP"
                type="text"
                placeholder="Ej. 192.168.1.50"
                value={ip}
                onChange={(
                  event,
                ) =>
                  setIp(
                    event.target.value,
                  )
                }
              />

              <Button
                type="button"
                variant="primary"
                className="mt-5 w-full"
                disabled={
                  isIdentifying
                }
                onClick={() =>
                  void handleIdentify()
                }
              >
                {isIdentifying
                  ? 'Buscando dispositivo...'
                  : 'Buscar dispositivo'}
              </Button>

            </CardContent>
          </Card>
        )}

        {identifiedDevice && (
          <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 sh-animate-fade-in-up dark:border-gray-800">
            <CardContent className="p-5 sm:p-6">

              <h2 className="text-lg font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-xl">
                Dispositivo encontrado
              </h2>

              <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900">

                <p className="break-words font-semibold tracking-tight text-[#1b254b] dark:text-white">
                  {
                    identifiedDevice.model
                  }
                </p>

                <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
                  IP:{' '}
                  {
                    identifiedDevice.wifiIp
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
                    setIdentifiedDevice(
                      null,
                    );

                    setDeviceName(
                      '',
                    );
                  }}
                >
                  Cambiar IP
                </Button>

              </div>

            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};
