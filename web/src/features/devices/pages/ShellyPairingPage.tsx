import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { createShellyPairingCredentials } from '../../../shared/api/shelly-pairing-contract';
import {
  cancelShellyPairingSession, completeShellyPairingSession, createShellyPairingSession,
  getShellyPairingSession, getShellySetupCapabilities, reportShellyPairingIdentity,
  type ShellyPairingSession, type ShellySetupCapabilities,
} from '../../../shared/api/shelly.api';

const panel = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#151824]';
const field = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white';

const statusLabels: Record<string, string> = {
  PENDING: 'Esperando datos del dispositivo',
  DEVICE_IDENTIFIED: 'Identidad recibida; pendiente de verificación',
  WAITING_FOR_MQTT: 'Esperando confirmación MQTT del backend',
  CONNECTED: 'Conexión MQTT confirmada',
  COMPLETED: 'Vinculación completada',
  CANCELLED: 'Sesión cancelada',
  EXPIRED: 'Sesión vencida',
  FAILED: 'Sesión fallida',
};

export const ShellyPairingPage = () => {
  const { homeId = '' } = useParams<{ homeId: string }>();
  const [capabilities, setCapabilities] = useState<ShellySetupCapabilities | null>(null);
  const [session, setSession] = useState<ShellyPairingSession | null>(null);
  const [token, setToken] = useState('');
  const [manufacturerDeviceId, setManufacturerDeviceId] = useState('');
  const [modelCode, setModelCode] = useState('');
  const [firmwareVersion, setFirmwareVersion] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    getShellySetupCapabilities(homeId)
      .then((value) => { if (live) setCapabilities(value); })
      .catch((reason: unknown) => { if (live) setError(reason instanceof Error ? reason.message : 'No se pudieron consultar las capacidades.'); });
    return () => { live = false; };
  }, [homeId]);

  const act = async (operation: () => Promise<void>) => {
    setBusy(true); setError('');
    try { await operation(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'La operación no pudo completarse.'); }
    finally { setBusy(false); }
  };

  const startSession = () => act(async () => {
    const credentials = createShellyPairingCredentials();
    const created = await createShellyPairingSession(homeId, credentials);
    setToken(credentials.sessionToken); setSession(created);
  });

  const refresh = () => act(async () => {
    if (!session) return;
    setSession(await getShellyPairingSession(homeId, session.sessionId, token));
  });

  const identify = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void act(async () => {
      if (!session) return;
      setSession(await reportShellyPairingIdentity(homeId, session.sessionId, token, {
        manufacturerDeviceId: manufacturerDeviceId.trim(),
        modelCode: modelCode.trim(),
        generation: capabilities?.compatibleModels.find((model) => model.modelCode === modelCode)?.generation ?? 0,
        ...(firmwareVersion.trim() ? { firmwareVersion: firmwareVersion.trim() } : {}),
      }));
    });
  };

  const complete = () => act(async () => {
    if (!session) return;
    const result = await completeShellyPairingSession(homeId, session.sessionId, token, deviceName.trim());
    setSession(result);
  });

  const cancel = () => act(async () => {
    if (!session) return;
    setSession(await cancelShellyPairingSession(homeId, session.sessionId, token));
    setToken('');
  });

  const terminal = ['COMPLETED', 'CANCELLED', 'EXPIRED', 'FAILED'].includes(session?.status ?? '');
  const ap = capabilities?.methods.AP;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-5 sm:p-8">
      <header>
        <Link to={`/homes/${homeId}/devices/add`} className="text-sm font-semibold text-blue-700 hover:underline dark:text-blue-300">← Volver a métodos de alta</Link>
        <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Alta Shelly · sesión AP</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Vincular dispositivo</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">La API coordina una sesión temporal para el hogar. Consulta las capacidades que reporta el backend antes de iniciar.</p>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{error}</div>}

      <section className={panel}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Capacidades informadas por el backend</h2>
        {!capabilities ? <p className="mt-3 text-sm text-slate-500">Consultando capacidades…</p> : <>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">Método preferido: <strong>{capabilities.preferredMethod}</strong></p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Modelos compatibles: {capabilities.compatibleModels.map((model) => `${model.modelCode} (Gen ${model.generation}; firmware: ${model.firmwareCompatibility})`).join(', ') || 'Ninguno reportado'}</p>
          {ap && <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Configuración local del equipo: {ap.deviceConfiguration}. Validación física: {ap.physicalValidation}.</p>}
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Credenciales MQTT: {capabilities.brokerCredentialProvisioning.status}</p>
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm leading-5 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">El navegador no ejecuta el RPC local que requiere el móvil ni configura el Wi-Fi del Shelly. La identidad enviada manualmente queda como no verificada. El backend aún debe observar una conexión MQTT autenticada e individual para completar el alta.</p>
        </>}
      </section>

      {!session ? <section className={panel}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Iniciar sesión temporal</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">La sesión expira según la política del servidor y su token se conserva solo en esta página.</p>
        <Button type="button" className="mt-4" disabled={!capabilities || busy || capabilities.preferredMethod !== 'AP'} onClick={() => void startSession()}>{busy ? 'Iniciando…' : 'Iniciar vinculación AP'}</Button>
      </section> : <section className={panel}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Sesión de vinculación</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Estado: <strong>{statusLabels[session.status] ?? session.status}</strong></p></div>
          <Button type="button" variant="outline" disabled={busy || !token} onClick={() => void refresh()}>Actualizar estado</Button>
        </div>
        <p className="mt-2 break-all text-xs text-slate-500">ID: {session.sessionId} · Vence: {new Date(session.expiresAt).toLocaleString()}</p>

        {session.status === 'PENDING' && token && <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={identify}>
          <label className="text-sm font-medium">ID del fabricante<input required maxLength={100} pattern="[A-Za-z0-9._:-]+" value={manufacturerDeviceId} onChange={(e) => setManufacturerDeviceId(e.target.value)} className={field} /></label>
          <label className="text-sm font-medium">Modelo compatible<select required value={modelCode} onChange={(e) => setModelCode(e.target.value)} className={field}><option value="">Selecciona desde los modelos compatibles que devuelve el backend</option>{capabilities?.compatibleModels.map((model) => <option key={model.modelCode} value={model.modelCode}>{model.modelCode} ? Gen {model.generation}</option>)}</select></label>
          <p className="self-center text-sm text-slate-600 dark:text-slate-300">La generaci?n se toma de las capacidades del backend para el modelo seleccionado.</p>
          <label className="text-sm font-medium">Firmware (opcional)<input maxLength={100} value={firmwareVersion} onChange={(e) => setFirmwareVersion(e.target.value)} className={field} /></label>
          <Button type="submit" disabled={busy} className="sm:col-span-2">Reportar identidad del dispositivo</Button>
        </form>}

        {session.identity && <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-900"><p className="font-semibold">Identidad reportada · {session.identity.verification}</p><p className="mt-1 break-all">{session.identity.manufacturerDeviceId} · {session.identity.modelCode} · Gen {session.identity.generation}</p></div>}

        {session.status === 'DEVICE_IDENTIFIED' && token && <div className="mt-5 space-y-3"><label className="block text-sm font-medium">Nombre para el dispositivo<input value={deviceName} onChange={(e) => setDeviceName(e.target.value)} required maxLength={100} className={field} /></label><Button type="button" disabled={busy || !deviceName.trim()} onClick={() => void complete()}>Solicitar cierre de vinculación</Button></div>}

        {session.status === 'WAITING_FOR_MQTT' && <p role="status" className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{session.completion?.message ?? 'El servidor todavía no confirma la conexión MQTT individual. Puedes consultar el estado de nuevo.'}</p>}
        {session.status === 'COMPLETED' && <p role="status" className="mt-5 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">Vinculación completada. ID del dispositivo: {session.completion?.deviceId ?? 'confirmado por backend'}.</p>}
        {session.failureCode && <p className="mt-4 text-sm text-red-700">Código reportado: {session.failureCode}</p>}
        {!terminal && token && <Button type="button" variant="outline" disabled={busy} className="mt-5" onClick={() => void cancel()}>Cancelar sesión</Button>}
      </section>}
    </main>
  );
};
