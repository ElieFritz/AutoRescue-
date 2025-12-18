'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth-store';
import { useNotificationStore } from '@/stores/notification-store';
import { useBreakdownStore } from '@/stores/breakdown-store';

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { accessToken, isAuthenticated } = useAuthStore();
  const { addNotification, setConnected } = useNotificationStore();
  const { setMechanicLocation, setActiveBreakdown } = useBreakdownStore();

  const connect = useCallback(() => {
    if (!accessToken || socketRef.current?.connected) return;

    socketRef.current = io(`${WS_URL}/notifications`, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    socketRef.current.on('notification', (notification) => {
      console.log('New notification:', notification);
      addNotification(notification);
    });

    socketRef.current.on('breakdown_update', (breakdown) => {
      console.log('Breakdown update:', breakdown);
      setActiveBreakdown(breakdown);
    });

    socketRef.current.on('mechanic_location', (location) => {
      console.log('Mechanic location:', location);
      setMechanicLocation(location);
    });
  }, [accessToken, addNotification, setConnected, setActiveBreakdown, setMechanicLocation]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  }, [setConnected]);

  const subscribeToBreakdown = useCallback((breakdownId: string) => {
    socketRef.current?.emit('subscribe', { room: `breakdown:${breakdownId}` });
  }, []);

  const unsubscribeFromBreakdown = useCallback((breakdownId: string) => {
    socketRef.current?.emit('unsubscribe', { room: `breakdown:${breakdownId}` });
  }, []);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, accessToken, connect, disconnect]);

  return {
    socket: socketRef.current,
    subscribeToBreakdown,
    unsubscribeFromBreakdown,
  };
}
