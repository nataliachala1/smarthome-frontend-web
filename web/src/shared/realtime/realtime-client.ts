import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getRealtimeSocket = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  if (!socket) {
    socket = io('http://localhost:3000/realtime', {
      auth: {
        token,
      },
      transports: ['websocket'],
      autoConnect: true,
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