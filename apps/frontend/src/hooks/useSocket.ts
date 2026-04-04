import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';
import type { Task } from '@/types';

// Connects to Socket.IO (via Vite proxy → localhost:3000)
// and calls onTaskUpdated whenever the server emits 'task:updated'
export function useSocket(onTaskUpdated: (task: Pick<Task, 'id' | 'status' | 'title'>) => void) {
  const token = useAuthStore((s) => s.token);
  // keep stable ref so the callback can update without reconnecting
  const cbRef = useRef(onTaskUpdated);
  cbRef.current = onTaskUpdated;

  useEffect(() => {
    if (!token) return;

    const socket: Socket = io('/', {
      // pass JWT so the server middleware can authenticate the WS connection
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('task:updated', (data) => cbRef.current(data));

    socket.on('connect_error', (err) => {
      console.error('[WS] connect error', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]); // reconnect only when token changes
}
