import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getDevice,
  listDeviceTypes,
  updateDevice,
  type Device,
  type DeviceType,
} from '../../../shared/api/devices.api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent } from '../../../components/ui/Card';

export const EditDevicePage = () => {
  const navigate = useNavigate();

  const { homeId, deviceId } = useParams<{
    homeId: string;
    deviceId: string;
  }>();

  const [device, setDevice] = useState<Device | null>(null);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);

  const [name, setName] = useState('');
  const [deviceTypeId, setDeviceTypeId] = useState('');
  const [transportType, setTransportType] =
    useState<'WIFI' | 'BLUETOOTH'>('WIFI');
  const [messagingProtocol, setMessagingProtocol] =
    useState<'MQTT'>('MQTT');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!homeId || !deviceId) {
        setError('No se encontró el dispositivo.');
        setIsLoading(false);
        return;
      }

      try {
        const [deviceResponse, typesResponse] = await Promise.all([
          getDevice(homeId, deviceId),
          listDeviceTypes(),
        ]);

        setDevice(deviceResponse);
        setDeviceTypes(typesResponse);

        setName(deviceResponse.name);
        setDeviceTypeId(deviceResponse.deviceTypeId);

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
        setError(
          cause instanceof Error
            ? cause.message
            : 'No fue posible cargar el dispositivo.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [homeId, deviceId]);

  const handleSubmit = async () => {
    if (!homeId || !deviceId) return;

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
        deviceTypeId,
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
                Tipo de dispositivo
              </label>

              <select
                value={deviceTypeId}
                onChange={(e) => setDeviceTypeId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:border-gray-700 dark:bg-[#151824]"
              >
                {deviceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

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