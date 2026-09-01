import { ref } from 'vue';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket.js';

export function useSocket() {
  const isConnected = ref(false);

  function connect(token) {
    const socket = connectSocket(token);

    socket.on('connect', () => {
      isConnected.value = true;
    });

    socket.on('disconnect', () => {
      isConnected.value = false;
    });

    socket.on('connect_error', (err) => {
      isConnected.value = false;
      // Only redirect for auth errors, not network issues
      if (err.message === 'Authentication required' || err.message === 'Invalid token' || err.message === 'Token expired') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    });
  }

  function disconnect() {
    disconnectSocket();
    isConnected.value = false;
  }

  return { isConnected, connect, disconnect };
}
