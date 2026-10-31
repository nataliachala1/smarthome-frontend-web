import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const opcionesMenu = [
  {
    clave: 'nav.dashboard',
    ruta: '/dashboard',
    icono: (className: string) => (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6zm10 0h8v-6h-8v6z" />
      </svg>
    ),
  },
  {
    clave: 'nav.homes',
    ruta: '/homes',
    icono: (className: string) => (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    clave: 'nav.consumption',
    ruta: '/reports',
    icono: (className: string) => (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    clave: 'nav.notifications',
    ruta: '/notifications',
    icono: (className: string) => (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
];

export const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!isOpen) return;

    const focusFrame = window.requestAnimationFrame(() => {
      document.getElementById('smarthome-navigation')
        ?.querySelector<HTMLElement>('a[href]')
        ?.focus();
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [isOpen]);

  return (
    <aside
      id="smarthome-navigation"
      className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[225px] max-w-[calc(100vw_-_2rem)] shrink-0 select-none flex-col overflow-y-auto border-r border-[#dce8f6] bg-[#f7faff] px-4 py-6 transition-transform duration-200 ease-out motion-reduce:transition-none dark:border-slate-800 dark:bg-[#101a2b] ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:z-auto lg:h-full lg:max-w-none lg:translate-x-0 ${isCollapsed ? 'lg:w-20' : 'lg:w-[225px]'}`}
    >
      <div>
        <div className={`flex items-center gap-2.5 border-b border-[#e1ecf8] pb-5 dark:border-slate-800 ${isCollapsed ? 'justify-center' : ''}`}>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? t('common.expandNavigation') : t('common.collapseNavigation')}
            aria-expanded={!isCollapsed}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#e8f3ff] text-[#0877f9] transition-[background-color,transform] duration-200 hover:bg-[#dfedfc] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/35 motion-reduce:transition-none motion-reduce:active:transform-none dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <svg aria-hidden="true" viewBox="0 0 64 64" className="h-9 w-9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 24L32 8L56 24V52C56 54.2091 54.2091 56 52 56H12C9.79086 56 8 54.2091 8 52V24Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M36 22L26 36H38L28 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <h2 className={`m-0 whitespace-nowrap text-[18px] font-bold tracking-[-0.04em] text-[#0a1740] dark:text-white sh-animate-fade-in ${isCollapsed ? 'lg:hidden' : ''}`}>
            <span className="text-[#0877f9]">Smart</span> Home
          </h2>
        </div>

        <nav aria-label={t('common.navigation')} className="mt-7 space-y-2">
          {opcionesMenu.map((opcion) => {
            const target = opcion.ruta;
            const isActive =
              location.pathname === target ||
              location.pathname.startsWith(`${target}/`) ||
              (opcion.ruta === '/reports' && /^\/homes\/[^/]+\/consumption(?:\/|$)/.test(location.pathname));

            return (
              <Link
                key={opcion.ruta}
                to={target}
                onClick={onClose}
                aria-label={isCollapsed ? t(opcion.clave) : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex min-h-14 items-center rounded-2xl px-4 py-3 transition-[background-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/30 active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:transform-none ${isCollapsed ? 'justify-center lg:px-0' : 'justify-start'} ${isActive ? 'bg-[#e8f2ff] font-semibold text-[#0877f9] shadow-[0_3px_12px_rgba(8,119,249,0.055)] before:absolute before:bottom-2.5 before:left-0 before:top-2.5 before:w-1 before:rounded-r-full before:bg-[#0877f9] dark:bg-[#172b49] dark:before:bg-[#75adff] dark:shadow-none' : 'font-medium text-[#526789] hover:bg-[#edf4fc] dark:text-slate-400 dark:hover:bg-slate-800'}`}
              >
                {opcion.icono(`h-6 w-6 shrink-0 ${isActive ? 'text-[#0877f9]' : 'text-[#526789] dark:text-slate-400'}`)}

                <span className={`ml-4 text-base leading-5 ${isCollapsed ? 'lg:hidden' : ''}`}>
                  {t(opcion.clave)}
                </span>

                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full z-50 ml-4 hidden -translate-x-1 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-[opacity,transform] duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none lg:block">
                    {t(opcion.clave)}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

    </aside>
  );
};
