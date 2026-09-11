import { useCallback, useEffect, useState } from 'react';

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
    <main className="min-h-screen bg-[#f4f7fe] p-6 dark:bg-[#0f111a]">
      <div className="mx-auto max-w-5xl space-y-7">

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <h1 className="text-3xl font-bold text-[#1b254b] dark:text-white">
                Notificaciones
              </h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-[#1866C1] px-3 py-1 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}

            </div>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Alertas y eventos importantes de SmartHome.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() =>
                void handleMarkAllAsRead()
              }
              className="rounded-xl bg-[#1866C1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1557a3] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Marcar todas como leídas
            </button>
          )}

        </header>

        {/* FILTROS */}

        <section className="flex w-fit rounded-xl bg-gray-100 p-1 dark:bg-gray-800">

          <button
            type="button"
            onClick={() =>
              setFilter('ALL')
            }
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
              filter === 'ALL'
                ? 'bg-white text-[#1866C1] shadow-sm dark:bg-[#1f2335] dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Todas
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter('UNREAD')
            }
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
              filter === 'UNREAD'
                ? 'bg-white text-[#1866C1] shadow-sm dark:bg-[#1f2335] dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            No leídas
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter('READ')
            }
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
              filter === 'READ'
                ? 'bg-white text-[#1866C1] shadow-sm dark:bg-[#1f2335] dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Leídas
          </button>

        </section>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
          >
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
            Cargando notificaciones...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center text-sm text-gray-500 shadow-sm dark:bg-[#151824] dark:text-gray-400">
            No tienes notificaciones en esta sección.
          </div>
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
                    className={`rounded-2xl border ${
                      isUnread
                        ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/10'
                        : 'border-gray-100 dark:border-gray-800'
                    }`}
                  >
                    <CardContent className="p-6">

                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                        <div className="flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            {isUnread && (
                              <span className="h-2.5 w-2.5 rounded-full bg-[#1866C1]" />
                            )}

                            <h2 className="text-base font-semibold text-[#1b254b] dark:text-white">
                              {
                                notification.title
                              }
                            </h2>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${getPriorityClasses(
                                notification.priority,
                              )}`}
                            >
                              {
                                notification.priority
                              }
                            </span>

                          </div>

                          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                            {
                              notification.message
                            }
                          </p>

                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-400">

                            <span>
                              {formatDate(
                                notification.createdAt,
                              )}
                            </span>

                            {notification.homeId && (
                              <span>
                                Hogar asociado
                              </span>
                            )}

                            {notification.deviceId && (
                              <span>
                                Dispositivo asociado
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
                              className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-[#1866C1] transition hover:bg-blue-50 disabled:opacity-60 dark:border-blue-900"
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
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
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
    </main>
  );
};

export default Notifications;