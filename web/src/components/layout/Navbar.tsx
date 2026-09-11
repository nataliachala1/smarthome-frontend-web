import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getRealtimeSocket } from '../../shared/realtime/realtime-client';
import { getUnreadNotificationsCount } from '../../shared/api/notifications.api';

export const Navbar = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

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

    const handleUnreadCountUpdated = (
      payload: { unreadCount: number },
    ) => {
      setUnreadCount(payload.unreadCount);
    };

    socket.on(
      'notification.unread_count.updated',
      handleUnreadCountUpdated,
    );

    return () => {
      socket.off(
        'notification.unread_count.updated',
        handleUnreadCountUpdated,
      );
    };
  }, []);

  return (
    <nav aria-label={t('common.header')} className="bg-white/95 dark:bg-[#090b12] border-b border-[#e5e5e5] dark:border-[#111827] px-4 sm:px-6 py-3 backdrop-blur-xl shadow-sm h-14">
      <div className="flex items-center justify-between h-full">
        <button type="button" onClick={onMenuClick} aria-label={t('common.openNavigation')} className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-primary">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          className="relative rounded-full p-2"
          aria-label="Notificaciones"
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
