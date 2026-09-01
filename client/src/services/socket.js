import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  return socket;
}

export function connectSocket(token) {
  // If already connected with same token, reuse
  if (socket?.connected) return socket;

  // Disconnect any stale connection
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io({
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
