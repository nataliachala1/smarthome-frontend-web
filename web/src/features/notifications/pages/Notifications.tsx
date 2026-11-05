import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  dismissNotification,
  getUnreadNotificationsCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
  type NotificationStatus,
} from '../../../shared/api/notifications.api';

import {
  Card,
  CardContent,
} from '../../../components/ui/Card';
import { getRealtimeSocket } from '../../../shared/realtime/realtime-client';

type NotificationFilter =
  | 'ALL'
  | 'UNREAD'
  | 'READ';

export const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [filter, setFilter] =
    useState<NotificationFilter>('ALL');

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [error, setError] =
    useState('');

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const status: NotificationStatus | undefined =
        filter === 'ALL'
          ? undefined
          : filter;

      const [
        notificationsResponse,
        unreadResponse,
      ] = await Promise.all([
        listNotifications({
          status,
          limit: 100,
        }),

        getUnreadNotificationsCount(),
      ]);

      setNotifications(
        notificationsResponse,
      );

      setUnreadCount(
        unreadResponse.unreadCount,
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible cargar las notificaciones.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const socket = getRealtimeSocket();

    if (!socket) {
      return;
    }

    const handleNotificationCreated = (
      notification: Notification,
    ) => {
      setUnreadCount((current) => current + 1);

      if (
        filter === 'ALL' ||
        filter === 'UNREAD'
      ) {
        setNotifications((current) => [
          notification,
          ...current,
        ]);
      }
    };

    const handleUnreadCountUpdated = (
      payload: { unreadCount: number },
    ) => {
      setUnreadCount(payload.unreadCount);
    };

    socket.on(
      'notification.created',
      handleNotificationCreated,
    );

    socket.on(
      'notification.unread_count.updated',
      handleUnreadCountUpdated,
    );

    return () => {
      socket.off(
        'notification.created',
        handleNotificationCreated,
      );

      socket.off(
        'notification.unread_count.updated',
        handleUnreadCountUpdated,
      );
    };
  }, [filter]);

  const handleMarkAsRead = async (
    notificationId: string,
  ) => {
    setIsUpdating(true);
    setError('');

    try {
      await markNotificationAsRead(
        notificationId,
      );

      await loadNotifications();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible marcar la notificación como leída.',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsUpdating(true);
    setError('');

    try {
      await markAllNotificationsAsRead();

      await loadNotifications();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible marcar todas las notificaciones como leídas.',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDismiss = async (
    notificationId: string,
  ) => {
    setIsUpdating(true);
    setError('');

    try {
      await dismissNotification(
        notificationId,
      );

      await loadNotifications();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible descartar la notificación.',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (
    value: string,
  ) =>
    new Intl.DateTimeFormat(
      'es-CO',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    ).format(
      new Date(value),
    );

  const getPriorityClasses = (
    priority: string,
  ) => {
    const normalized =
      priority.toUpperCase();

    if (
      normalized === 'HIGH' ||
      normalized === 'CRITICAL'
    ) {
      return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300';
    }

    if (normalized === 'MEDIUM') {
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300';
    }

    return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300';
  };

  return (
    <div className="min-h-full bg-[#f8fafc] dark:bg-[#0f111a]">
      <div className="mx-auto flex min-h-full w-full max-w-[1240px] flex-col sh-page-enter">

        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h1 className="text-[30px] font-bold leading-9 tracking-[-0.035em] text-[#0f172a] dark:text-white sm:text-[34px]">
              Notificaciones
            </h1>
            <p className="mt-1 text-[15px] leading-6 text-[#64748b] dark:text-slate-400">
              Alertas y eventos importantes de SmartHome.
            </p>
          </div>

          {notifications.length > 0 && unreadCount > 0 && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() =>
                void handleMarkAllAsRead()
              }
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0d6efd] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0b5ed7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6efd]/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            >
              Marcar todas como leídas
            </button>
          )}

        </header>

        {/* FILTROS */}

        <section aria-label="Filtrar notificaciones" className="mb-7 flex w-full max-w-[420px] rounded-xl bg-[#f1f5f9] p-1 dark:bg-slate-800 sm:w-fit">

          <button
            type="button"
            onClick={() =>
              setFilter('ALL')
            }
            aria-pressed={filter === 'ALL'}
            className={`min-h-11 min-w-0 flex-1 rounded-[9px] px-3 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6efd]/35 focus-visible:ring-offset-1 motion-reduce:transition-none sm:flex-none sm:px-5 ${
              filter === 'ALL'
                ? 'border border-[#e2e8f0] bg-white text-[#0d6efd] shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-[#1f2335] dark:text-blue-400'
                : 'border border-transparent bg-transparent text-[#475569] hover:text-[#0f172a] dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Todas
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter('UNREAD')
            }
            aria-pressed={filter === 'UNREAD'}
            className={`min-h-11 min-w-0 flex-1 rounded-[9px] px-3 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6efd]/35 focus-visible:ring-offset-1 motion-reduce:transition-none sm:flex-none sm:px-5 ${
              filter === 'UNREAD'
                ? 'border border-[#e2e8f0] bg-white text-[#0d6efd] shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-[#1f2335] dark:text-blue-400'
                : 'border border-transparent bg-transparent text-[#475569] hover:text-[#0f172a] dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            No leídas
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter('READ')
            }
            aria-pressed={filter === 'READ'}
            className={`min-h-11 min-w-0 flex-1 rounded-[9px] px-3 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6efd]/35 focus-visible:ring-offset-1 motion-reduce:transition-none sm:flex-none sm:px-5 ${
              filter === 'READ'
                ? 'border border-[#e2e8f0] bg-white text-[#0d6efd] shadow-[0_1px_3px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-[#1f2335] dark:text-blue-400'
                : 'border border-transparent bg-transparent text-[#475569] hover:text-[#0f172a] dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Leídas
          </button>

        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 shadow-sm shadow-red-900/5 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <div role="status" className="flex min-h-[320px] flex-1 items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center text-sm text-[#64748b] shadow-sm shadow-slate-900/5 dark:border-slate-700 dark:bg-[#151824] dark:text-slate-400 sm:min-h-[380px]">
            Cargando notificaciones...
          </div>
        ) : error && notifications.length === 0 ? (
          <section className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white px-5 py-10 text-center shadow-sm shadow-slate-900/5 dark:border-slate-700 dark:bg-[#151824] sm:min-h-[380px] sm:px-10 sm:py-12">
            <h2 className="text-lg font-bold tracking-tight text-[#0f172a] dark:text-white sm:text-xl">
              No fue posible cargar las notificaciones
            </h2>
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => void loadNotifications()}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0d6efd] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0b5ed7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6efd]/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            >
              Reintentar
            </button>
          </section>
        ) : notifications.length === 0 ? (
          <section className="flex min-h-[340px] flex-1 flex-col items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white px-5 py-10 text-center shadow-sm shadow-slate-900/5 dark:border-slate-700 dark:bg-[#151824] sm:min-h-[420px] sm:px-10 sm:py-12">
            <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#eff6ff] text-[#0d6efd] dark:bg-[#172b49] dark:text-[#75adff]">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            </div>
            <h2 className="mt-6 text-[22px] font-bold leading-8 tracking-[-0.025em] text-[#0f172a] dark:text-white sm:text-[28px]">
              No tienes notificaciones
            </h2>
            <p className="mt-2 max-w-[680px] text-[15px] leading-6 text-[#64748b] dark:text-slate-400 sm:text-base">
              Cuando recibas alertas, recordatorios o eventos importantes, aparecerán aquí.
            </p>
            <button
              type="button"
              onClick={() => navigate('/profile#profile-settings')}
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-[11px] bg-[#0d6efd] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0b5ed7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6efd]/35 focus-visible:ring-offset-2 motion-reduce:transition-none sm:w-auto"
            >
              Configurar notificaciones
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile#profile-settings')}
              className="mt-5 inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-[#0d6efd] transition-colors duration-200 hover:text-[#0b5ed7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d6efd]/35 motion-reduce:transition-none"
            >
              Ver preferencias
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </section>
        ) : (
          <section className="space-y-4">

            {notifications.map(
              (notification) => {
                const isUnread =
                  notification.status ===
                  'UNREAD';

                return (
                  <Card
                    key={notification.id}
                    className={`rounded-2xl border shadow-sm shadow-slate-900/5 dark:shadow-black/20 ${
                      isUnread
                        ? 'border-blue-200 bg-white dark:border-blue-900/50 dark:bg-[#151824]'
                        : 'border-[#e2e8f0] bg-white dark:border-slate-700 dark:bg-[#151824]'
                    }`}
                  >
                    <CardContent className="p-5 sm:p-6">

                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            {isUnread && (
                              <span className="h-2.5 w-2.5 rounded-full bg-[#1866C1]" />
                            )}

                            <h2 className="break-words text-base font-semibold tracking-tight text-[#0f172a] dark:text-white">
                              {
                                notification.title
                              }
                            </h2>

                            <span
                              className={`inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${getPriorityClasses(
                                notification.priority,
                              )}`}
                            >
                              {
                                notification.priority
                              }
                            </span>

                          </div>

                          <p className="mt-3 break-words text-sm leading-6 text-[#475569] dark:text-gray-300">
                            {
                              notification.message
                            }
                          </p>

                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 break-words text-xs text-gray-400 dark:text-gray-500">

                            <span>
                              {formatDate(
                                notification.createdAt,
                              )}
                            </span>

                            {notification.homeId && (
                              <span>
                                Hogar: {notification.homeName ?? 'asociado'}
                              </span>
                            )}

                            {notification.deviceId && (
                              <span>
                                Dispositivo: {notification.deviceName ?? 'asociado'}
                              </span>
                            )}

                          </div>

                        </div>

                        <div className="flex flex-wrap gap-2 sm:flex-col">

                          {isUnread && (
                            <button
                              type="button"
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                void handleMarkAsRead(
                                  notification.id,
                                )
                              }
                              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-[#1866C1] transition-colors duration-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1]/35 disabled:opacity-60 dark:border-blue-900 dark:focus-visible:ring-offset-[#151824] motion-reduce:transition-none"
                            >
                              Marcar como leída
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={
                              isUpdating
                            }
                            onClick={() =>
                              void handleDismiss(
                                notification.id,
                              )
                            }
                            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1866C1]/35 disabled:opacity-60 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-[#151824] motion-reduce:transition-none"
                          >
                            Descartar
                          </button>

                        </div>

                      </div>

                    </CardContent>
                  </Card>
                );
              },
            )}

          </section>
        )}

      </div>
    </div>
  );
};

export default Notifications;
