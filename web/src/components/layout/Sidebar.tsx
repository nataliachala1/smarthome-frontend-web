import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../app/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const opcionesMenu = [
  {
    clave: 'nav.dashboard',
    ruta: "/dashboard",
    icono: (className) => (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h8V3H3v10zm10 8h8V3h-8v18zM3 21h8v-6H3v6zm10 0h8v-6h-8v6z" />
      </svg>
    )
  },
  { 
    clave: 'nav.homes',
    ruta: "/homes", 
    icono: (className) => (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  { 
    clave: 'nav.reports',
    ruta: "/reports", 
    icono: (className) => (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    clave: 'nav.notifications',
    ruta: "/notifications",
    icono: (className) => (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )
  },
  { 
    clave: 'nav.settings',
    ruta: "/settings", 
    icono: (className) => (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
];

export const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside aria-label={t('common.navigation')} className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r dark:border-slate-800 min-h-screen p-4 flex flex-col justify-between transition-transform duration-300 relative select-none w-64 lg:static lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}>
      <div>
        {/* CABECERA CON CONTROL DE COLAPSO */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? t('common.expandNavigation') : t('common.collapseNavigation')}
            aria-expanded={!isCollapsed}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {!isCollapsed && (
            <h2 className="text-xl font-extrabold text-primary tracking-tight m-0">
              SmartHome
            </h2>
          )}
        </div>

        {/* MENÚ DE NAVEGACIÓN */}
        <nav className="space-y-1">
          {opcionesMenu.map((opcion) => {
            const isActive = location.pathname === opcion.ruta;
            return (
              <Link
                key={opcion.ruta}
                to={opcion.ruta}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center rounded-xl transition-all duration-200 p-2.5 relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isCollapsed ? "justify-center" : "justify-start"
                } ${isActive ? "bg-blue-50 dark:bg-blue-950/50 text-primary font-semibold" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/60"}`}
              >
                {opcion.icono(`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "text-gray-400 dark:text-gray-500"}`)}
                
                {!isCollapsed && <span className="ml-3 text-sm">{t(opcion.clave)}</span>}

                {/* Tooltip flotante solo visible en modo colapsado */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                    {t(opcion.clave)}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER DE USUARIO COMPACTO Y ADAPTATIVO */}
      <div className="border-t border-gray-100 dark:border-slate-800 pt-4 mt-auto w-full overflow-hidden">
        <div className={`flex ${isCollapsed ? "flex-col items-center gap-4" : "flex-row items-center justify-between gap-2"} w-full`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-primary font-bold shrink-0 border border-blue-200 dark:border-blue-800">
              U
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{user?.name ?? 'Usuario'}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{user?.email ?? ''}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={logout}
            aria-label={t('auth.logout')}
            title={t('auth.logout')}
            className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 transition-all flex items-center justify-center shrink-0 group relative focus-visible:ring-2 focus-visible:ring-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};