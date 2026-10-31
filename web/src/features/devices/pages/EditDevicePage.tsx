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
      <div className="sh-page-enter">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-gray-500 shadow-sm shadow-slate-900/5 dark:border-gray-800 dark:bg-[#151824] dark:text-gray-400">
          Cargando dispositivo...
        </div>
      </div>
    );
  }
  if (!isOwner) {
    return (
      <div className="sh-page-enter">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm shadow-red-900/5 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300 sm:p-6">
          No tienes permisos para editar este dispositivo.
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="sh-page-enter">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm shadow-red-900/5 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300 sm:p-6">
          {error || 'Dispositivo no encontrado.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f4f7fe] dark:bg-[#0f111a] sh-page-enter">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <button
            type="button"
            onClick={() =>
              navigate(`/homes/${homeId}/devices/${deviceId}`)
            }
            className="mb-3 inline-flex min-h-11 items-center text-sm font-semibold text-[#1866C1] transition-colors duration-200 hover:underline underline-offset-4 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1] focus-visible:ring-offset-4 motion-reduce:transition-none"
          >
            ← Volver al dispositivo
          </button>

          <h1 className="text-2xl font-bold tracking-tight text-[#1b254b] dark:text-white sm:text-3xl">
            Editar dispositivo
          </h1>

          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Modifica la configuración del dispositivo.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 shadow-sm shadow-red-900/5 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300 sm:p-5"
          >
            {error}
          </div>
        )}

        <Card className="rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 dark:border-gray-800">
          <CardContent className="space-y-5 p-5 sm:p-6">
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm shadow-slate-900/5 transition-[border-color,box-shadow,background-color] duration-200 focus:border-[#1866C1] focus:outline-none focus:ring-2 focus:ring-[#1866C1]/20 dark:border-gray-700 dark:bg-[#151824] dark:text-white dark:shadow-black/20 motion-reduce:transition-none"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm shadow-slate-900/5 transition-[border-color,box-shadow,background-color] duration-200 focus:border-[#1866C1] focus:outline-none focus:ring-2 focus:ring-[#1866C1]/20 dark:border-gray-700 dark:bg-[#151824] dark:text-white dark:shadow-black/20 motion-reduce:transition-none"
              >
                <option value="MQTT">MQTT</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-gray-800 sm:flex-row">
              <Button
                type="button"
                variant="primary"
                className="w-full sm:w-auto"
                disabled={isSaving}
                onClick={() => void handleSubmit()}
              >
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
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
    </div>
  );
};

export default EditDevicePage;
