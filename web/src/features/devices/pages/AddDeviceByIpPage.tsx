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
import { getHome, type Home } from '../../../shared/api/homes.api';
import { useAuth } from '../../../app/contexts/AuthContext';

export const AddDeviceByIpPage = () => {
  const { user } = useAuth();

  const navigate =
    useNavigate();

  const { homeId } =
    useParams<{
      homeId: string;
    }>();

  const [home, setHome] = useState<Home | null>(null);
  const [isLoadingHome, setIsLoadingHome] = useState(true);
  const isOwner = home?.createdBy === user?.id;
  useEffect(() => {
    if (!homeId) {
      setIsLoadingHome(false);
      return;
    }

    const loadHome = async () => {
      try {
        const homeResponse = await getHome(homeId);
        setHome(homeResponse);
      } finally {
        setIsLoadingHome(false);
      }
    };

    void loadHome();
  }, [homeId]);

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
      <main className="p-6">
        <p>
          No se encontró el hogar.
        </p>
      </main>
    );
  }

  if (isLoadingHome) {
    return (
      <main className="p-6">
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 dark:bg-[#151824] dark:text-gray-400">
          Verificando permisos...
        </div>
      </main>
    );
  }

  if (!isOwner) {
    return (
      <main className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          No tienes permisos para agregar dispositivos a este hogar.
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-[#f4f7fe] p-6 dark:bg-[#0f111a]">
      <div className="mx-auto max-w-2xl space-y-6">

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
            Agregar por IP
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Ingresa la dirección IP
            del dispositivo conectado
            a tu red.
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!identifiedDevice && (
          <Card>
            <CardContent className="p-6">

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
          <Card>
            <CardContent className="p-6">

              <h2 className="text-xl font-semibold text-[#1b254b] dark:text-white">
                Dispositivo encontrado
              </h2>

              <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-900">

                <p className="font-semibold text-[#1b254b] dark:text-white">
                  {
                    identifiedDevice.model
                  }
                </p>

                <p className="mt-1 text-sm text-gray-500">
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
    </main>
  );
};