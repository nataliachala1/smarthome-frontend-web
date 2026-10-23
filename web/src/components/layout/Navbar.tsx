import React from 'react';
import { useTranslation } from 'react-i18next';

export const Navbar = ({ onMenuClick }) => {
  const { t } = useTranslation();
  return (
    <nav aria-label={t('common.header')} className="bg-white/95 dark:bg-[#090b12] border-b border-[#e5e5e5] dark:border-[#111827] px-4 sm:px-6 py-3 backdrop-blur-xl shadow-sm h-14">
      <div className="flex items-center justify-between h-full">
        <button type="button" onClick={onMenuClick} aria-label={t('common.openNavigation')} className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-primary">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        {/* Aquí puedes colocar notificaciones o dejarlo vacío para un look minimalista */}
      </div>
    </nav>
  );
};

export default Navbar;
