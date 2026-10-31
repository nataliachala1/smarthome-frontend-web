import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { createShellyPairingCredentials } from '../../../shared/api/shelly-pairing-contract';
import {
  cancelShellyPairingSession, completeShellyPairingSession, createShellyPairingSession,
  getShellyPairingSession, getShellySetupCapabilities, reportShellyPairingIdentity,
  type ShellyPairingSession, type ShellySetupCapabilities,
} from '../../../shared/api/shelly.api';

const panel = 'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 dark:border-slate-700 dark:bg-[#151824]';
const field = 'mt-1 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm shadow-slate-900/5 outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:shadow-black/20 motion-reduce:transition-none';

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

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'warning',
  DEVICE_IDENTIFIED: 'info',
  WAITING_FOR_MQTT: 'warning',
  CONNECTED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'default',
  EXPIRED: 'default',
  FAILED: 'error',
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
    <div className="mx-auto max-w-4xl space-y-6 sh-page-enter">
      <header>
        <Link to={`/homes/${homeId}/devices/add`} className="inline-flex min-h-11 items-center rounded-md text-sm font-semibold text-blue-700 underline-offset-4 transition-colors duration-200 hover:text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-blue-300 dark:hover:text-blue-200 motion-reduce:transition-none">← Volver a métodos de alta</Link>
        <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Alta Shelly · sesión AP</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Vincular dispositivo</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">La API coordina una sesión temporal para el hogar. Consulta las capacidades que reporta el backend antes de iniciar.</p>
      </header>

      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800 shadow-sm shadow-red-900/5 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200 sm:p-5">{error}</div>}

      <section className={panel}>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Capacidades informadas por el backend</h2>
        {!capabilities ? <p role="status" className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-slate-600 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-slate-300">Consultando capacidades…</p> : <>
          <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">Método preferido: <strong>{capabilities.preferredMethod}</strong></p>
          <p className="mt-1 break-words text-sm leading-6 text-slate-700 dark:text-slate-300">Modelos compatibles: {capabilities.compatibleModels.map((model) => `${model.modelCode} (Gen ${model.generation}; firmware: ${model.firmwareCompatibility})`).join(', ') || 'Ninguno reportado'}</p>
          {ap && <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">Configuración local del equipo: {ap.deviceConfiguration}. Validación física: {ap.physicalValidation}.</p>}
          <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">Credenciales MQTT: {capabilities.brokerCredentialProvisioning.status}</p>
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">El navegador no ejecuta el RPC local que requiere el móvil ni configura el Wi-Fi del Shelly. La identidad enviada manualmente queda como no verificada. El backend aún debe observar una conexión MQTT autenticada e individual para completar el alta.</p>
        </>}
      </section>

      {!session ? <section className={panel}>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Iniciar sesión temporal</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">La sesión expira según la política del servidor y su token se conserva solo en esta página.</p>
        <Button type="button" className="mt-4 w-full sm:w-auto" disabled={!capabilities || busy || capabilities.preferredMethod !== 'AP'} onClick={() => void startSession()}>{busy ? 'Iniciando…' : 'Iniciar vinculación AP'}</Button>
      </section> : <section className={panel}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0"><h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Sesión de vinculación</h2><p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-6 text-slate-600 dark:text-slate-300"><span>Estado:</span><Badge variant={statusVariants[session.status] ?? 'default'}>{statusLabels[session.status] ?? session.status}</Badge></p></div>
          <Button type="button" variant="outline" className="w-full sm:w-auto" disabled={busy || !token} onClick={() => void refresh()}>Actualizar estado</Button>
        </div>
        <p className="mt-2 break-all text-xs text-slate-500">ID: {session.sessionId} · Vence: {new Date(session.expiresAt).toLocaleString()}</p>

        {session.status === 'PENDING' && token && <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={identify}>
          <label className="block min-w-0 text-sm font-medium text-slate-700 dark:text-slate-200">ID del fabricante<input required maxLength={100} pattern="[A-Za-z0-9._:-]+" value={manufacturerDeviceId} onChange={(e) => setManufacturerDeviceId(e.target.value)} className={field} /></label>
          <label className="block min-w-0 text-sm font-medium text-slate-700 dark:text-slate-200">Modelo compatible<select required value={modelCode} onChange={(e) => setModelCode(e.target.value)} className={field}><option value="">Selecciona desde los modelos compatibles que devuelve el backend</option>{capabilities?.compatibleModels.map((model) => <option key={model.modelCode} value={model.modelCode}>{model.modelCode} · Gen {model.generation}</option>)}</select></label>
          <p className="min-w-0 self-center text-sm leading-6 text-slate-600 dark:text-slate-300">La generación se toma de las capacidades del backend para el modelo seleccionado.</p>
          <label className="block min-w-0 text-sm font-medium text-slate-700 dark:text-slate-200">Firmware (opcional)<input maxLength={100} value={firmwareVersion} onChange={(e) => setFirmwareVersion(e.target.value)} className={field} /></label>
          <Button type="submit" disabled={busy} className="w-full sm:col-span-2">Reportar identidad del dispositivo</Button>
        </form>}

        {session.identity && <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-sm leading-6 dark:border-slate-700 dark:bg-slate-900"><p className="font-semibold text-slate-800 dark:text-slate-100">Identidad reportada · {session.identity.verification}</p><p className="mt-1 break-all text-slate-600 dark:text-slate-300">{session.identity.manufacturerDeviceId} · {session.identity.modelCode} · Gen {session.identity.generation}</p></div>}

        {session.status === 'DEVICE_IDENTIFIED' && token && <div className="mt-5 space-y-3"><label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Nombre para el dispositivo<input value={deviceName} onChange={(e) => setDeviceName(e.target.value)} required maxLength={100} className={field} /></label><Button type="button" className="w-full sm:w-auto" disabled={busy || !deviceName.trim()} onClick={() => void complete()}>Solicitar cierre de vinculación</Button></div>}

        {session.status === 'WAITING_FOR_MQTT' && <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">{session.completion?.message ?? 'El servidor todavía no confirma la conexión MQTT individual. Puedes consultar el estado de nuevo.'}</p>}
        {session.status === 'COMPLETED' && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">Vinculación completada. ID del dispositivo: {session.completion?.deviceId ?? 'confirmado por backend'}.</p>}
        {session.failureCode && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">Código reportado: {session.failureCode}</p>}
        {!terminal && token && <Button type="button" variant="outline" disabled={busy} className="mt-5 w-full sm:w-auto" onClick={() => void cancel()}>Cancelar sesión</Button>}
      </section>}
    </div>
  );
};
