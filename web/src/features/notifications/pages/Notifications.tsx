import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Notifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const deleteAll = () => {
    setNotifications([]);
  };

  const getNotificationMeta = (type) => {
    const map = {
      highConsumption: {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      deviceOffline: {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.828m2.829 2.828L21 21M21 3L3 21M4.929 4.929A9 9 0 0012 21M7.757 7.757a5 5 0 017.071 0" />
          </svg>
        ),
      },
      tariffChange: {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ),
      },
      info: {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    };
    return map[type] || map.info;
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) {
      return `Hace ${minutes} min`;
    } else if (hours < 24) {
      return `Hace ${hours} h`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-8 min-h-screen bg-[#f4f5f9] dark:bg-[#0f111a] font-sans antialiased transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        
        {/* CABECERA */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1e1e2f] dark:text-white flex items-center gap-2.5 tracking-tight">
              {t('notifications.title')}
              {unreadCount > 0 && (
                <span className="bg-[#635bff] text-white text-[11px] font-bold h-5 px-2 rounded-full flex items-center justify-center min-w-[20px]">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1">Alertas y notificaciones del sistema</p>
          </div>
          
          {/* ACCIONES DE CABECERA */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="bg-[#635bff] hover:bg-[#5249f0] text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all shadow-sm shadow-indigo-100 dark:shadow-none"
              >
                {t('notifications.markAsRead')}
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                onClick={deleteAll} 
                className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {t('notifications.deleteAll')}
              </button>
            )}
          </div>
        </div>

        {/* LISTA DE TARJETAS */}
        <div className="space-y-3">
          {notifications.map((notification) => {
            const meta = getNotificationMeta(notification.type);
            return (
              <div 
                key={notification.id} 
                // CORRECCIÓN AQUÍ: Si NO está leída (!notification.read), toda la tarjeta adopta el fondo azulito oscuro bg-[#2563eb] con textos blancos.
                className={`rounded-xl p-4 transition-all duration-200 border shadow-[0_4px_12px_rgba(0,0,0,0.015)] ${
                  !notification.read 
                    ? 'bg-[#2563eb] border-transparent text-white' 
                    : 'bg-white dark:bg-[#151824] border-gray-100/50 dark:border-gray-800/50 opacity-85 text-gray-900'
                }`}
                role="article"
              >
                <div className="flex items-center justify-between gap-6">
                  
                  {/* LADO IZQUIERDO: ICONO + DETALLES */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    
                    {/* Contenedor del icono (Blanco translúcido si la tarjeta es azul oscuro) */}
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      !notification.read
                        ? 'bg-white/15 text-white'
                        : 'bg-[#635bff]/5 text-[#635bff] dark:bg-[#635bff]/10 dark:text-indigo-400'
                    }`}>
                      {meta.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3 className={`text-sm tracking-tight ${
                          !notification.read 
                            ? 'text-white font-bold' 
                            : 'text-gray-900 dark:text-gray-100 font-semibold'
                        }`}>
                          {notification.title}
                        </h3>
                        <span className={`text-[11px] font-medium ${
                          !notification.read ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          • {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 line-clamp-1 leading-normal font-medium ${
                        !notification.read ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {notification.message}
                      </p>
                    </div>
                  </div>

                  {/* LADO DERECHO: ACCIONES Y PUNTO EN FILA */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    
                    {/* Botones de acción minimalistas con herencia de color blanca si está activa */}
                    <div className="flex items-center gap-3 text-xs">
                      {!notification.read && (
                        <button 
                          onClick={() => markAsRead(notification.id)} 
                          className="text-white hover:text-white/80 font-bold transition-colors"
                        >
                          {t('notifications.markAsRead')}
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notification.id)} 
                        className={`font-semibold transition-colors ${
                          !notification.read 
                            ? 'text-white/80 hover:text-white' 
                            : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'
                        }`}
                      >
                        {t('common.delete')}
                      </button>
                    </div>

                    {/* Indicador de estado por punto */}
                    <div className="w-2 h-2 flex-shrink-0 flex items-center justify-center">
                      {!notification.read && (
                        <span className="w-2 h-2 bg-white rounded-full shadow-sm" />
                      )}
                    </div>

                  </div>

                </div>
              </div>
            );
          })}

          {/* ESTADO VACÍO */}
          {notifications.length === 0 && (
            <div className="bg-white dark:bg-[#151824] rounded-xl p-16 text-center shadow-[0_4px_12px_rgba(0,0,0,0.015)] border border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">No tienes notificaciones en este momento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
