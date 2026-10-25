import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getDevice,
  updateDevice,
  type Device,
} from '../../../shared/api/devices.api';
import {
  getHome,
  listMembers,
  type HomeMember,
} from '../../../shared/api/homes.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent } from '../../../components/ui/Card';
import { useAuth } from '../../../app/contexts/AuthContext';

export const EditDevicePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { homeId, deviceId } = useParams<{
    homeId: string;
    deviceId: string;
  }>();

  const [device, setDevice] = useState<Device | null>(null);
  const [currentMembership, setCurrentMembership] = useState<HomeMember | null>(null);

  const [name, setName] = useState('');
  const [transportType, setTransportType] =
    useState<'WIFI' | 'BLUETOOTH'>('WIFI');
  const [messagingProtocol, setMessagingProtocol] =
    useState<'MQTT'>('MQTT');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const isOwner =
    currentMembership?.homeId === homeId &&
    currentMembership?.userId === user?.id &&
    currentMembership?.status === 'ACTIVE' &&
    currentMembership?.role === 'OWNER';

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setCurrentMembership(null);
    setDevice(null);
    setError('');

    const load = async () => {
      if (!homeId || !deviceId || !user?.id) {
        if (active) {
          setError('No se pudo verificar el hogar, el dispositivo o el usuario.');
          setIsLoading(false);
        }
        return;
      }

      try {
        const [, deviceResponse, members] = await Promise.all([
          getHome(homeId),
          getDevice(homeId, deviceId),
          listMembers(homeId),
        ]);

        if (!active) return;

        const membership = members.find(
          (member) =>
            member.homeId === homeId &&
            member.userId === user.id &&
            member.status === 'ACTIVE'
        );

        if (!membership) {
          setCurrentMembership(null);
          setError('No tienes una membresía activa en este hogar.');
          return;
        }

        setCurrentMembership(membership);

        if (membership.role !== 'OWNER') {
          setError('Solo el propietario puede editar dispositivos.');
          return;
        }

        setDevice(deviceResponse);
        setName(deviceResponse.name);

        if (
          deviceResponse.transportType === 'WIFI' ||
          deviceResponse.transportType === 'BLUETOOTH'
        ) {
          setTransportType(deviceResponse.transportType);
        }

        if (deviceResponse.messagingProtocol === 'MQTT') {
          setMessagingProtocol('MQTT');
        }
      } catch (cause) {
        if (active) {
          setCurrentMembership(null);
          setError(
            cause instanceof Error
              ? cause.message
              : 'No fue posible verificar los permisos o cargar el dispositivo.'
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [homeId, deviceId, user?.id]);

  const handleSubmit = async () => {
    if (!homeId || !deviceId || !isOwner) return;

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('El nombre del dispositivo es obligatorio.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await updateDevice(homeId, deviceId, {
        name: trimmedName,
        transportType,
        messagingProtocol,
      });

      navigate(`/homes/${homeId}/devices/${deviceId}`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible actualizar el dispositivo.',
      );
    } finally {
      setIsSaving(false);
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
  if (!isOwner) {
    return (
      <main className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          No tienes permisos para editar este dispositivo.
        </div>
      </main>
    );
  }

  if (!device) {
    return (
      <main className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Dispositivo no encontrado.'}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fe] p-6 dark:bg-[#0f111a]">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <button
            type="button"
            onClick={() =>
              navigate(`/homes/${homeId}/devices/${deviceId}`)
            }
            className="mb-3 text-sm font-semibold text-[#1866C1] hover:underline"
          >
            ← Volver al dispositivo
          </button>

          <h1 className="text-3xl font-bold text-[#1b254b] dark:text-white">
            Editar dispositivo
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Modifica la configuración del dispositivo.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <Card className="rounded-2xl border border-gray-100 dark:border-gray-800">
          <CardContent className="p-6 space-y-5">
            <Input
              label="Nombre del dispositivo"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de transporte
              </label>

              <select
                value={transportType}
                onChange={(e) =>
                  setTransportType(
                    e.target.value as 'WIFI' | 'BLUETOOTH',
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-gray-700 dark:bg-[#151824]"
              >
                <option value="WIFI">WIFI</option>
                <option value="BLUETOOTH">BLUETOOTH</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Protocolo de mensajería
              </label>

              <select
                value={messagingProtocol}
                onChange={() => setMessagingProtocol('MQTT')}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-gray-700 dark:bg-[#151824]"
              >
                <option value="MQTT">MQTT</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="primary"
                disabled={isSaving}
                onClick={() => void handleSubmit()}
              >
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isSaving}
                onClick={() =>
                  navigate(`/homes/${homeId}/devices/${deviceId}`)
                }
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default EditDevicePage;
