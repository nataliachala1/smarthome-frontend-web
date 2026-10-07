import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

const REALTIME_URL = (
  import.meta.env.VITE_REALTIME_URL || '/realtime'
).replace(/\/$/, '');

const getCurrentToken = () => localStorage.getItem('token');

export const getRealtimeSocket = () => {
  if (!getCurrentToken()) {
    return null;
  }

  if (!socket) {
    socket = io(REALTIME_URL, {
      auth: (callback) => {
        const token = getCurrentToken();

        callback({
          token: token ?? '',
        });
      },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
    });

    socket.on('connect_error', (error) => {
      console.warn('Realtime: error de conexión.', error.message);
    });

    socket.io.on('reconnect_attempt', () => {
      if (!getCurrentToken()) {
        socket?.disconnect();
        socket = null;
      }
    });
  }

  return socket;
};

export const disconnectRealtimeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
