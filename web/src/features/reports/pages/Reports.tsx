import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Reports = () => {
  const { t } = useTranslation();

  // Estados
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [conteoNoLeidas, setConteoNoLeidas] = useState(1);
  const [añoSeleccionado, setAñoSeleccionado] = useState('2026');
  const [menuAñoAbierto, setMenuAñoAbierto] = useState(false);
  
  const nodoNotificaciones = useRef<HTMLDivElement>(null);
  const nodoAño = useRef<HTMLDivElement>(null);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickAfuera = (e) => {
      if (nodoNotificaciones.current && !nodoNotificaciones.current.contains(e.target as Node)) {
        setMostrarNotificaciones(false);
      }
      if (nodoAño.current && !nodoAño.current.contains(e.target as Node)) {
        setMenuAñoAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickAfuera);
    return () => document.removeEventListener('mousedown', handleClickAfuera);
  }, []);

  const marcarComoLeidas = () => {
    setConteoNoLeidas(0);
  };

  return (
    <div className="p-6 min-h-screen bg-[#f4f5f9] dark:bg-[#0f111a] font-sans antialiased text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================= ENCABEZADO PRINCIPAL ORIGINAL ================= */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#151824] p-4 rounded-2xl border border-gray-100 dark:border-gray-800/40 shadow-sm">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#1e1e2f] dark:text-white m-0">
              {t('Reportes')}
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {t('Sábado, 09 de mayo del 2026')}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* BARRA DE BÚSQUEDA */}
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder={t('Buscar en reportes...')}
                className="w-full sm:w-60 bg-gray-50 dark:bg-gray-800/40 text-xs pl-4 pr-10 py-2.5 rounded-full border border-gray-200/60 dark:border-gray-800 focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-400 text-gray-700 dark:text-gray-200"
              />
              <button type="button" className="absolute right-1 top-1 bg-primary hover:bg-blue-700 text-white p-1.5 rounded-full shadow-sm transition-all flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* CAMPANITA DE NOTIFICACIONES */}
            <div className="relative" ref={nodoNotificaciones}>
              <button
                type="button"
                onClick={() => {
                  setMostrarNotificaciones(!mostrarNotificaciones);
                  if (!mostrarNotificaciones) marcarComoLeidas();
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

              {/* MENÚ NOTIFICACIONES */}
              {mostrarNotificaciones && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#151824] rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-4 z-50">
                  <h4 className="text-xs font-bold text-gray-800 dark:text-white mb-2">{t('Notificaciones')}</h4>
                  <div className="space-y-2">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                      {t('El reporte mensual de Abril ya está disponible.')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= EXPORTAR Y PROGRAMAR REPORTES ================= */}
        <div className="w-full bg-white dark:bg-[#151824] p-4 rounded-xl border border-gray-100 dark:border-gray-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-50 dark:bg-gray-800/60 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">{t('Exportar y programar reportes')}</h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{t('Genera archivos descargables automáticamente o envíalos a tu email.')}</p>
            </div>
          </div>
          <button type="button" className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-blue-700 rounded-xl transition-colors">
            {t('Configurar Reporte')}
          </button>
        </div>

        {/* ================= SECCIÓN DE TARJETAS ALINEADAS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* TARJETA 1: HISTORIAL (CON TU AZUL VIBRANTE ORIGINAL) */}
          <div className="bg-primary rounded-2xl p-5 text-white flex flex-col justify-between h-full relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded">{t('Historial')}</span>
                <h2 className="text-xs font-bold text-white/80 mt-2">{t('Consumo total')}</h2>
              </div>
              <span className="text-[10px] font-bold bg-white/10 text-white px-2 py-0.5 rounded-full">+2.08%</span>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black tracking-tight">$612.917</span>
            </div>
          </div>

          {/* TARJETA 2: CONSUMO DE AHORRO */}
          <div className="bg-white dark:bg-[#151824] rounded-2xl p-5 border border-gray-100 dark:border-gray-800/40 shadow-sm flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-400 inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500">{t('Consumo de ahorro')}</h2>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-0.5 rounded-full">+12.4%</span>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-extrabold text-[#1e1e2f] dark:text-white tracking-tight">34.760</span>
            </div>
          </div>

          {/* TARJETA 3: ESTADÍSTICAS DEL PRODUCTO */}
          <div className="bg-white dark:bg-[#151824] rounded-2xl p-5 border border-gray-100 dark:border-gray-800/40 shadow-sm flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <h2 className="text-xs font-bold text-[#1e1e2f] dark:text-white">{t('Estadísticas del producto')}</h2>
              <span className="text-xs text-gray-400 font-medium">{t('Hoy')}</span>
            </div>
            <div className="flex items-center justify-center py-2">
              <div className="relative w-14 h-14 rounded-full border-4 border-[#4c3ff7] border-t-transparent flex items-center justify-center">
                <div className="text-center">
                  <span className="text-xs font-bold block text-gray-800 dark:text-white">9.829</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ================= SECCIÓN GRÁFICA ORIGINAL ================= */}
        <div className="bg-white dark:bg-[#151824] p-5 rounded-2xl border border-gray-100 dark:border-gray-800/40 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#1e1e2f] dark:text-white">{t('Consumo')}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t('Seguimiento del consumo de sus clientes')}</p>
            </div>

            {/* SELECTOR DE AÑO */}
            <div className="relative" ref={nodoAño}>
              <button
                type="button"
                onClick={() => setMenuAñoAbierto(!menuAñoAbierto)}
                className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700/60"
              >
                <span>{añoSeleccionado}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuAñoAbierto && (
                <div className="absolute right-0 mt-1 w-24 bg-white dark:bg-[#151824] border border-gray-100 dark:border-gray-800 rounded-xl shadow-md z-30 overflow-hidden">
                  {['2024', '2025', '2026', '2027', '2028'].map((año) => (
                    <button
                      key={año}
                      type="button"
                      onClick={() => {
                        setAñoSeleccionado(año);
                        setMenuAñoAbierto(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                    >
                      {año}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CONTENEDOR DE BARRAS DE LA GRÁFICA (CON EL COLOR CORREGIDO) */}
          <div className="h-44 flex items-end justify-between gap-4 pt-4 px-1">
            <div className="flex-1 h-[30%] bg-indigo-50 dark:bg-gray-800/40 rounded-lg"></div>
            <div className="flex-1 h-[55%] bg-indigo-50 dark:bg-gray-800/40 rounded-lg"></div>
            <div className="flex-1 h-[45%] bg-indigo-50 dark:bg-gray-800/40 rounded-lg"></div>
            <div className="flex-1 h-[90%] bg-primary rounded-lg relative">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm whitespace-nowrap">
                43.787 <br/> Consumo
              </div>
            </div>
            <div className="flex-1 h-[35%] bg-indigo-50 dark:bg-gray-800/40 rounded-lg"></div>
            <div className="flex-1 h-[60%] bg-indigo-50 dark:bg-gray-800/40 rounded-lg"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export { Reports };
export default Reports;
