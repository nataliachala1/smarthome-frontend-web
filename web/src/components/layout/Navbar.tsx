import { useEffect, useRef, useState, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getRealtimeSocket } from '../../shared/realtime/realtime-client';
import { getUnreadNotificationsCount } from '../../shared/api/notifications.api';
import { useTheme } from '../../app/contexts/ThemeContext';
import { useAuth } from '../../app/contexts/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
  isNavigationOpen: boolean;
  menuButtonRef: RefObject<HTMLButtonElement>;
}

export const Navbar = ({ onMenuClick, isNavigationOpen, menuButtonRef }: NavbarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await getUnreadNotificationsCount();
        setUnreadCount(response.unreadCount);
      } catch {
        setUnreadCount(0);
      }
    };

    void loadUnreadCount();

    const socket = getRealtimeSocket();

    if (!socket) {
      return;
    }

    const handleUnreadCountUpdated = (payload: { unreadCount: number }) => {
      setUnreadCount(payload.unreadCount);
    };

    socket.on('notification.unread_count.updated', handleUnreadCountUpdated);

    return () => {
      socket.off('notification.unread_count.updated', handleUnreadCountUpdated);
    };
  }, []);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      profileMenuRef.current
        ?.querySelector<HTMLElement>('[role="menuitem"]')
        ?.focus();
    });

    const handlePointerDown = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !profileMenuRef.current?.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
        profileMenuTriggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const displayName = user?.name?.trim() || 'Usuario';
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <header
      className="z-20 h-[92px] shrink-0 border-b border-[#e8eef7] bg-white/95 px-4 shadow-[0_2px_10px_rgba(35,70,120,0.035)] backdrop-blur-xl dark:border-slate-800 dark:bg-[#111b2d]/95 sm:px-5"
    >
      <div className="flex h-full items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={onMenuClick}
            aria-label={t('common.openNavigation')}
            aria-expanded={isNavigationOpen}
            aria-controls="smarthome-navigation"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e4ebf5] bg-white text-[#50658c] transition-colors duration-150 hover:bg-[#f5f8fd] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 lg:hidden"
          >
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-[#e8eef7] bg-[#f8fafd] p-1.5 shadow-[0_3px_12px_rgba(35,70,120,0.045)] dark:border-slate-700 dark:bg-slate-900/70 sm:gap-2.5">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={t('settings.theme')}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e7edf5] bg-white text-[#17264d] transition-colors duration-150 hover:border-[#cbdcf5] hover:bg-[#f1f6ff] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/30 dark:border-slate-700 dark:bg-[#172236] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="4" />
                <path strokeLinecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#e7edf5] bg-white text-[#17264d] transition-colors duration-150 hover:border-[#cbdcf5] hover:bg-[#f1f6ff] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/30 dark:border-slate-700 dark:bg-[#172236] dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label={`${t('nav.notifications')}${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
          >
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full border border-white bg-red-500 dark:border-slate-900" />
            )}
          </button>

          <div ref={profileMenuRef} className="relative">
            <button
              ref={profileMenuTriggerRef}
              type="button"
              onClick={() => setIsProfileMenuOpen((open) => !open)}
            className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-xl border border-transparent py-1.5 pl-1.5 pr-2 text-left text-[#18264a] transition-colors duration-150 hover:border-[#e2eaf5] hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/30 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800 sm:gap-3 sm:pr-3"
              aria-label={`Perfil de ${displayName}`}
              aria-haspopup="menu"
              aria-expanded={isProfileMenuOpen}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf2ff] text-xs font-bold text-[#0877f9] ring-2 ring-white dark:bg-[#1b3457] dark:text-[#9cc4ff] dark:ring-slate-900">
                {initials || 'U'}
              </span>
              <span className="hidden max-w-40 truncate text-sm font-semibold sm:block">{displayName}</span>
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className={`hidden h-4 w-4 text-[#50658c] transition-transform motion-reduce:transition-none sm:block ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isProfileMenuOpen && (
              <div
                role="menu"
                aria-label="Menú de cuenta"
                onKeyDown={(event) => {
                  const items = Array.from(
                    event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'),
                  );
                  const currentIndex = items.indexOf(document.activeElement as HTMLElement);
                  let nextIndex = -1;

                  if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % items.length;
                  if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length;
                  if (event.key === 'Home') nextIndex = 0;
                  if (event.key === 'End') nextIndex = items.length - 1;

                  if (nextIndex >= 0 && items.length > 0) {
                    event.preventDefault();
                    items[nextIndex]?.focus();
                  }
                }}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setIsProfileMenuOpen(false);
                  }
                }}
                className="absolute right-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#e6ebf2] bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.16)] dark:border-slate-700 dark:bg-[#151e2e] sh-animate-slide-down"
              >
                <div role="none" className="flex items-center gap-3 px-3 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf2ff] text-xs font-bold text-[#0877f9] dark:bg-[#1b3457] dark:text-[#9cc4ff]">
                    {initials || 'U'}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#18264a] dark:text-slate-100">{displayName}</p>
                    <p className="truncate text-xs text-[#71819b] dark:text-slate-400">{user?.email || ''}</p>
                  </div>
                </div>

                <div role="separator" className="my-1 border-t border-[#edf1f6] dark:border-slate-700" />
                <p role="none" className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8] dark:text-slate-500">Tu Smart Home</p>

                {([
                  { label: t('nav.homes'), path: '/homes', icon: 'home' },
                  { label: t('nav.access'), path: '/access', icon: 'access' },
                  { label: t('notifications.invitations'), path: '/notifications/invitations', icon: 'invitation' },
                ] as const).map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate(item.path);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-[#334155] transition-colors hover:bg-[#f3f6fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/30 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0 text-[#687a95] dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {item.icon === 'home' && <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>}
                      {item.icon === 'access' && <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>}
                      {item.icon === 'invitation' && <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>}
                    </svg>
                    <span>{item.label}</span>
                  </button>
                ))}

                <p role="none" className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8] dark:text-slate-500">Mi cuenta</p>
                {([
                  { label: t('nav.profile'), path: '/profile', icon: 'user' },
                  { label: t('nav.settings'), path: '/profile#profile-settings', icon: 'settings' },
                ] as const).map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate(item.path);
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-[#334155] transition-colors hover:bg-[#f3f6fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/30 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0 text-[#687a95] dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {item.icon === 'user' && <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>}
                      {item.icon === 'settings' && <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1a1.7 1.7 0 1 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 1 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 1 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V4a1.7 1.7 0 1 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 1 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2.9Z" /></>}
                    </svg>
                    <span>{item.label}</span>
                  </button>
                ))}

                <div role="separator" className="my-1 border-t border-[#edf1f6] dark:border-slate-700" />
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/help');
                  }}
                  className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-[#334155] transition-colors hover:bg-[#f3f6fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0877f9]/30 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0 text-[#687a95] dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.5 2.5 0 1 1 4.2 1.8c-.9.8-1.8 1.2-1.8 2.7m0 3h.01" />
                  </svg>
                  Centro de ayuda
                </button>

                <div role="separator" className="my-1 border-t border-[#edf1f6] dark:border-slate-700" />
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 17l5-5-5-5m5 5H3" />
                    <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                  </svg>
                  <span>{t('auth.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
