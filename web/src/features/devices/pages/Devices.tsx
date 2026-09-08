import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createDevice, listDeviceTypes, listDevices, type Device, type DeviceType } from '../../../shared/api/devices.api';
import { listHomes, type Home } from '../../../shared/api/homes.api';

const Devices = () => {
  const { t } = useTranslation();

  const [devicesList, setDevicesList] = useState<Device[]>([]);
  const [homes, setHomes] = useState<Home[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [selectedHomeId, setSelectedHomeId] = useState(() => localStorage.getItem('activeHomeId') || '');
  const [loadError, setLoadError] = useState('');

  // 2. Estados para la barra de Smart Suggestion
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [isOptimized, setIsOptimized] = useState(false);

  // 3. Estados para el modal "Agregar Dispositivo"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('');
  const [newPower, setNewPower] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const [availableHomes, availableTypes] = await Promise.all([listHomes(), listDeviceTypes()]);
        setHomes(availableHomes);
        setDeviceTypes(availableTypes);
        const homeId = selectedHomeId && availableHomes.some((home) => home.id === selectedHomeId)
          ? selectedHomeId
          : availableHomes[0]?.id || '';
        setSelectedHomeId(homeId);
        if (homeId) {
          const availableDevices = await listDevices(homeId);
          setDevicesList(availableDevices);
          setNewDeviceType((current) => current || availableTypes[0]?.id || '');
        }
      } catch (cause) {
        setLoadError(cause instanceof Error ? cause.message : 'No fue posible cargar los dispositivos.');
      }
    })();
  }, [selectedHomeId]);

  const toggleDeviceActive = (id: string) => {
    // El backend todavía no expone un endpoint de control; no simulamos el estado local.
    setLoadError(`El dispositivo ${id} no tiene una operación de encendido disponible en el backend.`);
  };

  // Función para manejar el botón "Optimizar Ahora"
  const handleOptimizeNow = () => {
    setIsOptimized(true);
  };

  // Función para guardar un nuevo dispositivo
  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!selectedHomeId || !newName.trim() || !newDeviceType) return;
    try {
      const device = await createDevice(selectedHomeId, {
        deviceTypeId: newDeviceType,
        name: newName.trim(),
      });
      setDevicesList((current) => [...current, device]);
    } catch (cause) {
      setLoadError(cause instanceof Error ? cause.message : 'No fue posible crear el dispositivo.');
      return;
    }
    setNewName('');
    setNewPower('');
    setIsModalOpen(false);
  };

  const activeCount = devicesList.filter((d) => d.isOn).length;
  const totalCount = devicesList.length;

  return (
    <div className="p-6 min-h-screen bg-[#f4f5f9] dark:bg-[#0f111a] font-sans antialiased text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {loadError && (
          <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {loadError}
          </div>
        )}
        {homes.length > 1 && (
          <label className="block text-xs font-bold text-gray-500">
            Hogar
            <select value={selectedHomeId} onChange={(e) => {
              localStorage.setItem('activeHomeId', e.target.value);
              setSelectedHomeId(e.target.value);
            }} className="ml-2 rounded-lg border px-2 py-1">
              {homes.map((home) => <option key={home.id} value={home.id}>{home.name}</option>)}
            </select>
          </label>
        )}

        {/* ================= ENCABEZADO CORREGIDO (IMAGE_28279A.PNG) ================= */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#151824] p-4 rounded-2xl border border-gray-100 dark:border-gray-800/40 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1e1e2f] dark:text-white m-0">
              {t('Mis Dispositivos')}
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Gestiona y controla todos tus equipos IoT en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* BARRA DE BÚSQUEDA REDONDEADA */}
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Buscar en reportes..."
                className="w-full sm:w-60 bg-gray-50 dark:bg-gray-800/40 text-xs pl-4 pr-12 py-2.5 rounded-full border border-gray-200/60 dark:border-gray-800 focus:outline-none focus:border-[#4c3ff7] transition-colors placeholder-gray-400 text-gray-700 dark:text-gray-200"
              />
              <button 
                type="button" 
                aria-label={t('common.search')}
                className="absolute right-1 top-1 bg-[#4c3ff7] hover:bg-[#3b31db] text-white p-1.5 rounded-full shadow-sm transition-all flex items-center justify-center w-7 h-7"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* CAMPANITA DE NOTIFICACIONES */}
            <div className="relative">
              <button
                type="button"
                aria-label={t('nav.notifications')}
                className="p-2.5 bg-white dark:bg-[#151824] text-gray-500 dark:text-gray-400 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm hover:scale-105 transition-all relative flex items-center justify-center w-10 h-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#151824]">
                  1
                </span>
              </button>
            </div>

            {/* BOTÓN AGREGAR DISPOSITIVO */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1e56ff] hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1"
            >
              <span className="text-base font-bold">+</span> Agregar Dispositivo
            </button>
          </div>
        </div>

        {/* ================= BARRA DE SMART SUGGESTION ================= */}
        {showSuggestion && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <span>💡</span> Smart Suggestion
              </h4>
              <p className="text-[11px] font-medium text-amber-700/90 dark:text-gray-400 mt-1 max-w-xl">
                {isOptimized 
                  ? '¡El Calentador de Agua ha sido configurado en modo ecológico correctamente!' 
                  : 'Detectamos que el Calentador de Agua consume el 40% de tu energía total. ¿Deseas programar un horario de bajo consumo?'}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleOptimizeNow}
                disabled={isOptimized}
                className={`flex-1 sm:flex-none whitespace-nowrap text-[11px] font-bold px-4 py-2 rounded-lg transition-all ${
                  isOptimized 
                    ? 'bg-emerald-600 text-white cursor-default' 
                    : 'bg-amber-950 text-white dark:bg-amber-500 dark:text-amber-950 hover:opacity-90'
                }`}
              >
                {isOptimized ? '✓ Optimizado' : 'Optimizar Ahora'}
              </button>
              <button
                onClick={() => setShowSuggestion(false)}
                className="flex-1 sm:flex-none whitespace-nowrap bg-white/80 dark:bg-transparent border border-gray-200 dark:border-gray-700 text-xs font-bold px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50"
              >
                {isOptimized ? 'Cerrar' : 'Más tarde'}
              </button>
            </div>
          </div>
        )}

        {/* ================= TARJETAS DE RESUMEN ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TARJETA 1 */}
          <div className="bg-white dark:bg-[#151824] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-[#1e56ff] rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Consumo Total Hoy</span>
                <p className="text-2xl font-extrabold text-[#1e1e2f] dark:text-white tracking-tight mt-0.5">14.3 kWh</p>
              </div>
            </div>
            <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> EN VIVO
            </span>
          </div>

          {/* TARJETA 2 */}
          <div className="bg-white dark:bg-[#151824] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/50 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 5h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dispositivos Activos</span>
              <p className="text-2xl font-extrabold text-[#1e1e2f] dark:text-white tracking-tight mt-0.5">
                {activeCount < 10 ? `0${activeCount}` : activeCount} <span className="text-sm font-bold text-gray-400">/ {totalCount}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ================= GRILLA DE DISPOSITIVOS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {devicesList.map((device) => (
            <div
              key={device.id}
              className={`p-5 rounded-3xl transition-all duration-300 relative flex flex-col justify-between h-64 border ${
                device.isOn
                  ? 'bg-gradient-to-br from-[#0c4eff] to-[#0038cb] text-white shadow-lg border-transparent'
                  : 'bg-white dark:bg-[#151824] text-gray-900 dark:text-white border-gray-100 dark:border-gray-800/70 shadow-sm'
              }`}
            >
              {/* Indicador de Estado Superior Derecho */}
              <div className="flex justify-end items-start w-full">
                <span className={`w-2 h-2 rounded-full ${device.isOn ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
              </div>

              {/* Info Cuerpo */}
              <div className="mt-2">
                <h3 className={`text-lg font-bold tracking-tight $                {device.isOn ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                  {device.name}
                </h3>
                <span className={`text-[9px] font-bold tracking-wider uppercase block mt-0.5 ${device.isOn ? 'text-white/60' : 'text-gray-400'}`}>
                  {device.name}
                </span>
              </div>

              {/* Parámetros técnicos */}
              <div className="flex justify-between items-center border-t border-dashed pt-4 mt-4 border-white/20 dark:border-gray-800/60">
                <div>
                  <p className={`text-[10px] font-medium ${device.isOn ? 'text-white/70' : 'text-gray-400'}`}>Potencia</p>
                  <p className="text-xs font-bold">{device.currentPowerW ?? 0} W</p>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-medium ${device.isOn ? 'text-white/70' : 'text-gray-400'}`}>Estado</p>
                  <p className="text-xs font-bold font-mono">{device.connectivityStatus}</p>
                </div>
              </div>

              {/* Switch de Encendido */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => toggleDeviceActive(device.id)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                    device.isOn ? 'bg-white' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ${
                      device.isOn ? 'translate-x-5 bg-[#0038cb]' : 'translate-x-0 bg-white'
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ================= MODAL AGREGAR DISPOSITIVO ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#151824] rounded-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-800 shadow-xl">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Añadir Nuevo Equipo IoT</h3>
            <form onSubmit={handleAddDevice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Cafetera Smart"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Tipo de dispositivo</label>
                <select
                  required
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="" disabled>Selecciona un tipo</option>
                  {deviceTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-xs font-bold bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-xl hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-[#1e56ff] text-white rounded-xl hover:bg-blue-700"
                >
                  Guardar Nodo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export { Devices };
export default Devices;