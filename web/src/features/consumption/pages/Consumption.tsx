import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Consumption = () => {
  const { t } = useTranslation();

  // 1. ESTADO INTERACTIVO PARA LOS BOTONES
  const [timeFilter, setTimeFilter] = useState('24h');

  // 2. NUEVOS ESTADOS PARA EL BUSCADOR Y NOTIFICACIONES
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [conteoNoLeidas, setConteoNoLeidas] = useState(1);

  // 3. DATOS DINÁMICOS DEL DESGLOSE POR HABITACIÓN
  const roomData = {
    '24h': [
      { name: 'Sala de Estar', devices: '5 ' + t('dispositivos'), consumption: '12.4 kWh', percentage: '45%', color: 'bg-blue-600' },
      { name: 'Cocina', devices: '3 ' + t('dispositivos'), consumption: '8.2 kWh', percentage: '30%', color: 'bg-emerald-500' },
      { name: 'Dormitorio Principal', devices: '2 ' + t('dispositivos'), consumption: '4.1 kWh', percentage: '15%', color: 'bg-orange-500' }
    ],
    '7d': [
      { name: 'Sala de Estar', devices: '5 ' + t('dispositivos'), consumption: '86.8 kWh', percentage: '43%', color: 'bg-blue-600' },
      { name: 'Cocina', devices: '3 ' + t('dispositivos'), consumption: '60.4 kWh', percentage: '31%', color: 'bg-emerald-500' },
      { name: 'Dormitorio Principal', devices: '2 ' + t('dispositivos'), consumption: '32.1 kWh', percentage: '16%', color: 'bg-orange-500' }
    ],
    '30d': [
      { name: 'Sala de Estar', devices: '5 ' + t('dispositivos'), consumption: '360.2 kWh', percentage: '44%', color: 'bg-blue-600' },
      { name: 'Cocina', devices: '3 ' + t('dispositivos'), consumption: '246.5 kWh', percentage: '30%', color: 'bg-emerald-500' },
      { name: 'Dormitorio Principal', devices: '2 ' + t('dispositivos'), consumption: '130.8 kWh', percentage: '15%', color: 'bg-orange-500' }
    ]
  };

  return (
    <div className="p-6 min-h-screen bg-[#f4f5f9] dark:bg-[#0f111a] font-sans antialiased text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================= BARRA SUPERIOR CON BUSCADOR Y CAMPANA INTEGRADOS ================= */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#151824] p-4 rounded-2xl border border-gray-100 dark:border-gray-800/40 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1e1e2f] dark:text-white m-0">
              {t('Panel de Control')}
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {t('Monitoreo en tiempo real de tu consumo energético')}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* BARRA DE BÚSQUEDA REDONDEADA */}
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Buscar en reportes..."
                className="w-full sm:w-60 bg-gray-50 dark:bg-gray-800/40 text-xs pl-4 pr-12 py-2.5 rounded-full border border-gray-200/60 dark:border-gray-800 focus:outline-none focus:border-primary transition-colors placeholder-gray-400 text-gray-700 dark:text-gray-200"
              />
              <button 
                type="button" 
                aria-label={t('common.search')}
                className="absolute right-1 top-1 bg-primary hover:bg-blue-700 text-white p-1.5 rounded-full shadow-sm transition-all flex items-center justify-center w-7 h-7"
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
                onClick={() => {
                  setMostrarNotificaciones(!mostrarNotificaciones);
                  setConteoNoLeidas(0);
                }}
                className={`p-2.5 rounded-full shadow-sm hover:scale-105 transition-all relative flex items-center justify-center min-w-[40px] min-h-[40px] ${
                  mostrarNotificaciones ? 'bg-primary text-white' : 'bg-white dark:bg-[#151824] text-gray-500 dark:text-gray-400'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {conteoNoLeidas > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#151824]">
                    {conteoNoLeidas}
                  </span>
                )}
              </button>

              {/* MENÚ DESPLEGABLE DE NOTIFICACIONES */}
              {mostrarNotificaciones && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#151824] rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-4 z-50">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-white mb-2">Notificaciones</h4>
                  <div className="space-y-2">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                      Se ha detectado un consumo alto en la Sala de Estar hace unos momentos.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BARRA SUPERIOR DE BIENVENIDA */}
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
          <div>
            Bienvenido de nuevo
          </div>
        </div>

        {/* ================= RECUADRO: DESGLOSE POR HABITACIÓN CON SELECTOR INTERACTIVO ================= */}
        <div className="bg-white dark:bg-[#151824] p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800/50 shadow-sm space-y-4">
          <div className="flex flex-row justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-[#1e1e2f] dark:text-white">
                {t('Desglose por Habitación')}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {t('Detalle comparativo de uso energético por ambiente')}
              </p>
            </div>

            {/* El selector de tiempo controla los datos del desglose */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/30 shadow-inner">
              {['24h', '7d', '30d'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ${
                    timeFilter === filter
                      ? 'bg-white dark:bg-[#1f2335] text-gray-900 dark:text-white shadow-sm scale-105'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {roomData[timeFilter].map((room, index) => (
              <div key={index} className="space-y-2.5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${room.color}`}></span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
                        {room.name}
                      </h4>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {room.devices}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                    {room.consumption}
                  </span>
                </div>

                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className={`${room.color} h-full rounded-full transition-all duration-300`} style={{ width: room.percentage }}></div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-semibold text-gray-400">
                    {room.percentage} {t('del total')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= CUATRO TARJETAS DE MÉTRICAS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tarjeta 1: Consumo en Vivo */}
          <div className="bg-white dark:bg-[#151824] p-5 rounded-2xl border border-gray-100/70 dark:border-gray-800/50 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Consumo en vivo</span>
              <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                EN VIVO
              </span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-[#1e1e2f] dark:text-white tracking-tight">2.27 kWh</span>
              <p className="text-[11px] text-gray-400 font-medium mt-1">Tendencia estable hoy</p>
            </div>
          </div>

          {/* Tarjeta 2: Consumo de Hoy */}
          <div className="bg-white dark:bg-[#151824] p-5 rounded-2xl border border-gray-100/70 dark:border-gray-800/50 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Consumo de hoy</span>
              <div className="text-indigo-500 dark:text-indigo-400 p-1 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-[#1e1e2f] dark:text-white tracking-tight">15.8 kWh</span>
              <p className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                ↓ -12% <span className="text-gray-400 font-medium">vs ayer</span>
              </p>
            </div>
          </div>

          {/* Tarjeta 3: Costo Estimado */}
          <div className="bg-white dark:bg-[#151824] p-5 rounded-2xl border border-gray-100/70 dark:border-gray-800/50 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Costo Estimado</span>
              <div className="text-blue-500 dark:text-blue-400 p-1 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-[#1e1e2f] dark:text-white tracking-tight">51.30 €</span>
              <p className="text-[11px] text-gray-400 font-medium mt-1">Proyección final de mes</p>
            </div>
          </div>

          {/* Tarjeta 4: Dispositivos */}
          <div className="bg-white dark:bg-[#151824] p-5 rounded-2xl border border-gray-100/70 dark:border-gray-800/50 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dispositivos</span>
              <div className="text-indigo-500 dark:text-indigo-400 p-1 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-[#1e1e2f] dark:text-white tracking-tight">8</span>
              <p className="text-[11px] text-gray-400 font-medium mt-1">de 12 configurados</p>
            </div>
          </div>
        </div>

        {/* ================= SECCIÓN INTERMEDIA: GRÁFICA Y ALERTAS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GRÁFICA DE TIEMPO REAL */}
          <div className="lg:col-span-2 bg-white dark:bg-[#151824] p-6 rounded-2xl border border-gray-100/70 dark:border-gray-800/50 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-base font-bold text-[#1e1e2f] dark:text-white">Tiempo Real</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Fluctuación de carga en las últimas 24 horas</p>
              </div>
              <div className="flex bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-1 text-[11px] font-bold text-gray-400">
                <span className="px-2.5 py-1 bg-white dark:bg-[#151824] text-gray-800 dark:text-white rounded-lg shadow-sm">24h</span>
                <span className="px-2.5 py-1 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">7d</span>
                <span className="px-2.5 py-1 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">30d</span>
              </div>
            </div>

            {/* Barras de la gráfica */}
            <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
              {[
                { tag: '00:00', h: 'h-[55%]' }, { tag: '', h: 'h-[40%]' },
                { tag: '06:00', h: 'h-[75%]' }, { tag: '', h: 'h-[90%]' },
                { tag: '12:00', h: 'h-[50%]' }, { tag: '', h: 'h-[35%]' },
                { tag: '18:00', h: 'h-[70%]' }, { tag: '', h: 'h-[95%]', active: true },
                { tag: '23:59', h: 'h-[60%]' }
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full h-full flex items-end justify-center">
                    <div className={`w-full rounded-lg transition-all duration-300 ${item.h} ${item.active ? 'bg-[#3b82f6]' : 'bg-indigo-50 dark:bg-indigo-950/20 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30'}`}></div>
                  </div>
                  {item.tag && (
                    <span className="text-[10px] text-gray-400 font-semibold mt-2 block whitespace-nowrap">{item.tag}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN ALERTAS Y RECOMENDACIONES */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1e1e2f] dark:text-white">Alertas</h3>
                <span className="text-rose-500 bg-rose-50 dark:bg-rose-950/20 w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs">1</span>
              </div>

              <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900/40 rounded-xl p-4 flex gap-3">
                <div className="text-amber-500 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/xl" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">Consumo alto detectado</h4>
                  <p className="text-[11px] font-medium text-amber-700/90 dark:text-amber-400/80 mt-1">Revisa los dispositivos con consumo elevado.</p>
                </div>
              </div>

              <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100/80 dark:border-blue-900/40 rounded-xl p-4 flex gap-3">
                <div className="text-blue-500 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300">Tarifa valle activa</h4>
                  <p className="text-[11px] font-medium text-blue-700/90 dark:text-blue-400/80 mt-1">Válido hasta las 08:00 AM. Aprovecha el ahorro.</p>
                </div>
              </div>
            </div>

            {/* RECOMENDACIONES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1e1e2f] dark:text-white">Recomendaciones</h3>
                <div className="text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>

              <div className="bg-white dark:bg-[#151824] border border-gray-100/70 dark:border-gray-800/50 p-4 rounded-xl flex items-center justify-between group">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 dark:text-white">Apaga el aire en zonas no utilizadas</h4>
                  <p className="text-[10px] text-emerald-500 font-bold mt-1 uppercase">Ahorro potencial: 15%</p>
                </div>
                <div className="text-gray-300 group-hover:text-gray-500 font-bold text-sm">&gt;</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export { Consumption };
export default Consumption;
