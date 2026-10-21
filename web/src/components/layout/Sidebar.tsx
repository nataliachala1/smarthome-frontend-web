import React, { useState } from "react";
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

  return (
    <aside
      aria-label={t('common.navigation')}
      className={`relative z-40 flex h-screen w-60 shrink-0 select-none flex-col overflow-y-auto border-r border-[#e8eef7] bg-[#f7faff] p-4 transition-all duration-300 dark:border-slate-800 dark:bg-[#101a2b] ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:translate-x-0 ${isCollapsed ? 'lg:w-20' : 'lg:w-60'}`}
    >
      <div>
        <div className={`flex items-center gap-2.5 border-b border-[#e5edf8] pb-5 dark:border-slate-800 ${isCollapsed ? 'justify-center' : ''}`}>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? t('common.expandNavigation') : t('common.collapseNavigation')}
            aria-expanded={!isCollapsed}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0877f9] shadow-sm ring-1 ring-[#e8eef7] transition hover:bg-[#eef5ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/30 dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 10.6 12 3l9 7.6V21a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V10.6Z" />
            </svg>
          </button>

          {!isCollapsed && (
            <h2 className="m-0 whitespace-nowrap text-[16px] font-extrabold tracking-tight text-[#0a1740] dark:text-white">
              <span className="text-[#0877f9]">Smart</span> Home
            </h2>
          )}
        </div>

        <nav className="mt-6 space-y-2.5">
          {opcionesMenu.map((opcion) => {
            const target = opcion.ruta;
            const isActive =
              location.pathname === target ||
              location.pathname.startsWith(`${target}/`);

            return (
              <Link
                key={opcion.ruta}
                to={target}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex min-h-12 items-center rounded-xl px-3 py-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/30 ${isCollapsed ? 'justify-center' : 'justify-start'} ${isActive ? 'bg-white font-semibold text-[#0877f9] shadow-sm ring-1 ring-[#e4edf9] before:absolute before:bottom-3 before:left-0 before:top-3 before:w-[3px] before:rounded-r-full before:bg-[#0877f9] dark:bg-[#172b49] dark:ring-slate-700' : 'text-[#50658c] hover:bg-white/80 dark:text-slate-400 dark:hover:bg-slate-800'}`}
              >
                {opcion.icono(`h-5 w-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`)}

                {!isCollapsed && <span className="ml-3 text-sm">{t(opcion.clave)}</span>}

                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full z-50 ml-4 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
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