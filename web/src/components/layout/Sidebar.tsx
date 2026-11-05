import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

const opcionesMenu = [
  {
    clave: 'nav.dashboard',
    ruta: '/dashboard',
    icono: (className: string) => <DashboardOutlinedIcon aria-hidden="true" className={className} />,
  },
  {
    clave: 'nav.homes',
    ruta: '/homes',
    icono: (className: string) => <HomeOutlinedIcon aria-hidden="true" className={className} />,
  },
  {
    clave: 'nav.consumption',
    ruta: '/reports',
    icono: (className: string) => <BarChartOutlinedIcon aria-hidden="true" className={className} />,
  },
  {
    clave: 'nav.notifications',
    ruta: '/notifications',
    icono: (className: string) => <NotificationsNoneOutlinedIcon aria-hidden="true" className={className} />,
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
        <div className="relative flex items-center justify-end border-b border-[#e1ecf8] pb-5 dark:border-slate-800">
          <h2 className={`absolute left-0 right-12 m-0 min-w-0 whitespace-nowrap text-center text-[21px] font-extrabold leading-none tracking-[-0.045em] text-[#0a1740] dark:text-white sh-animate-fade-in ${isCollapsed ? 'lg:hidden' : ''}`}>
            <span><span className="text-[#0877f9]">Smart</span> Home</span>
          </h2>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? t('common.expandNavigation') : t('common.collapseNavigation')}
            aria-expanded={!isCollapsed}
            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e4ebf5] bg-white text-[#50658c] transition-[background-color,border-color,transform] duration-200 hover:border-[#cbdcf2] hover:bg-[#f5f8fd] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/35 motion-reduce:transition-none motion-reduce:active:transform-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3.5" y="4" width="17" height="16" rx="2" />
              <path d="M9 4v16" />
              {isCollapsed ? <path d="m14 9 3 3-3 3" /> : <path d="m15 9-3 3 3 3" />}
            </svg>
          </button>
        </div>

        <nav aria-label={t('common.navigation')} className="mt-6 space-y-1.5">
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
                className={`group relative flex min-h-[52px] items-center gap-3 rounded-xl px-3 py-2.5 transition-[background-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/30 active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:transform-none ${isCollapsed ? 'justify-center lg:px-0' : 'justify-start'} ${isActive ? 'bg-[#e8f2ff] font-semibold text-[#0877f9] shadow-[0_2px_8px_rgba(8,119,249,0.06)] before:absolute before:bottom-2.5 before:left-0 before:top-2.5 before:w-1 before:rounded-r-full before:bg-[#0877f9] dark:bg-[#172b49] dark:before:bg-[#75adff] dark:shadow-none' : 'font-medium text-[#526789] hover:bg-white hover:shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:shadow-none'}`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors duration-200 ${isActive ? 'bg-white text-[#0877f9] shadow-[0_1px_4px_rgba(8,119,249,0.08)] dark:bg-[#213a5f] dark:shadow-none' : 'bg-[#eef4fb] text-[#526789] group-hover:bg-[#e6effb] dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700'}`}>
                  {opcion.icono('h-5 w-5')}
                </span>

                <span className={`text-[15px] leading-5 ${isCollapsed ? 'lg:hidden' : ''}`}>
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
