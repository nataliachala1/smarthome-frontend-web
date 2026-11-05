import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const sections = [
  { path: '/notifications', label: 'notifications.section' },
  { path: '/notifications/invitations', label: 'notifications.invitations' },
];

export const NotificationsSectionNav = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <nav
      aria-label={t('notifications.sectionNavigation')}
      className="mb-6 flex w-full max-w-md gap-1 rounded-xl bg-[#f1f5f9] p-1 dark:bg-slate-800"
    >
      {sections.map(({ path, label }) => {
        const isActive = pathname === path;

        return (
          <Link
            key={path}
            to={path}
            aria-current={isActive ? 'page' : undefined}
            className={`flex-1 rounded-[9px] px-3 py-2.5 text-center text-sm font-semibold transition-colors duration-150 ${
              isActive
                ? 'bg-white text-[#0d6efd] shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:bg-[#1f2335] dark:text-blue-400'
                : 'text-[#475569] hover:text-[#0f172a] dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t(label)}
          </Link>
        );
      })}
    </nav>
  );
};
