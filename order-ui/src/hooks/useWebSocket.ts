import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

export interface OrderUpdate {
  orderId: string;
  status: string;
  customerName: string;
  timestamp: string;
  amount: number;
  type: 'created' | 'updated' | 'deleted' | 'status_changed';
}

export interface NotificationMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  userId?: string;
  orderId?: string;
}

export interface SystemStats {
  connectedUsers: number;
  totalSessions: number;
  serverUptime: number;
  timestamp: string;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export const useWebSocket = (userId?: string, userName?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0
  });
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [orderUpdates, setOrderUpdates] = useState<OrderUpdate[]>([]);
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000;

  const connect = useCallback(() => {
    if (connectionState.isConnecting || connectionState.isConnected) return;

    setConnectionState(prev => ({ ...prev, isConnecting: true, error: null }));

    const newSocket = io(process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionDelay: reconnectDelay,
      reconnectionAttempts: maxReconnectAttempts,
      forceNew: true
    });

    // Connection successful
    newSocket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      setConnectionState({
        isConnected: true,
        isConnecting: false,
        error: null,
        reconnectAttempts: 0
      });

      // Authenticate user if credentials provided
      if (userId && userName) {
        newSocket.emit('authenticate', { userId, name: userName });
      }

      toast.success('Connected to real-time updates!', {
        position: 'bottom-right',
        autoClose: 3000
      });
    });

    // Handle order updates
    newSocket.on('order_update', (update: OrderUpdate) => {
      console.log('📦 Order update received:', update);
      setOrderUpdates(prev => [update, ...prev.slice(0, 49)]); // Keep last 50 updates

      // Show toast notification
      const icon = update.type === 'created' ? '✅' : 
                  update.type === 'updated' ? '🔄' : 
                  update.type === 'deleted' ? '🗑️' : '📋';
      
      toast.info(`${icon} Order ${update.orderId.split('-')[0]}... ${update.type}`, {
        position: 'bottom-right',
        autoClose: 4000
      });
    });

    // Handle detailed order updates
    newSocket.on('order_detail_update', (update: OrderUpdate & { detailedInfo: boolean }) => {
      console.log('📋 Detailed order update:', update);
      // Trigger refresh of order details if viewing specific order
      window.dispatchEvent(new CustomEvent('orderDetailUpdate', { detail: update }));
    });

    // Handle notifications
    newSocket.on('notification', (notification: NotificationMessage) => {
      console.log('🔔 Notification received:', notification);
      setNotifications(prev => [notification, ...prev.slice(0, 99)]); // Keep last 100 notifications

      // Show toast based on notification type
      const toastFn = notification.type === 'success' ? toast.success :
                     notification.type === 'warning' ? toast.warn :
                     notification.type === 'error' ? toast.error : toast.info;

      toastFn(notification.message, {
        position: 'top-right',
        autoClose: notification.type === 'error' ? 8000 : 5000
      });
    });

    // Handle bulk updates
    newSocket.on('bulk_order_update', (updates: OrderUpdate[]) => {
      console.log('📦 Bulk order updates:', updates.length);
      setOrderUpdates(prev => [...updates, ...prev.slice(0, 50 - updates.length)]);
      
      toast.info(`📦 ${updates.length} orders updated`, {
        position: 'bottom-right',
        autoClose: 3000
      });
    });

    // Handle system stats
    newSocket.on('system_stats', (stats: SystemStats) => {
      setSystemStats(stats);
    });

    // Handle metrics updates
    newSocket.on('metrics_update', (metrics: any) => {
      window.dispatchEvent(new CustomEvent('metricsUpdate', { detail: metrics }));
    });

    // Handle emergency notifications
    newSocket.on('emergency_notification', (notification: NotificationMessage & { emergencyType: string }) => {
      toast.error(`🚨 ${notification.title}: ${notification.message}`, {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false
      });
    });

    // Handle typing indicators
    newSocket.on('user_typing', (data: { userName: string; timestamp: string }) => {
      window.dispatchEvent(new CustomEvent('userTyping', { detail: data }));
    });

    newSocket.on('user_stopped_typing', () => {
      window.dispatchEvent(new CustomEvent('userStoppedTyping'));
    });

    // Handle pong response
    newSocket.on('pong', (data: { timestamp: string; serverTime: number }) => {
      const latency = Date.now() - data.serverTime;
      window.dispatchEvent(new CustomEvent('latencyUpdate', { detail: { latency } }));
    });

    // Connection error
    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Connection failed',
        reconnectAttempts: prev.reconnectAttempts + 1
      }));

      if (connectionState.reconnectAttempts < maxReconnectAttempts) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectDelay * Math.pow(2, connectionState.reconnectAttempts)); // Exponential backoff
      } else {
        toast.error('Failed to connect to real-time updates. Please refresh the page.', {
          position: 'top-center',
          autoClose: false
        });
      }
    });

    // Disconnection
    newSocket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: reason === 'io server disconnect' ? 'Server disconnected' : null
      }));

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        setTimeout(connect, reconnectDelay);
      }
    });

    setSocket(newSocket);
  }, [userId, userName, connectionState.isConnecting, connectionState.isConnected, connectionState.reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    
    setConnectionState({
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0
    });
  }, [socket]);

  const joinOrderRoom = useCallback((orderId: string) => {
    if (socket && connectionState.isConnected) {
      socket.emit('join_order_room', orderId);
    }
  }, [socket, connectionState.isConnected]);

  const leaveOrderRoom = useCallback((orderId: string) => {
    if (socket && connectionState.isConnected) {
      socket.emit('leave_order_room', orderId);
    }
  }, [socket, connectionState.isConnected]);

  const sendTypingStart = useCallback((orderId: string) => {
    if (socket && connectionState.isConnected && userName) {
      socket.emit('typing_start', { orderId, userName });
    }
  }, [socket, connectionState.isConnected, userName]);

  const sendTypingStop = useCallback((orderId: string) => {
    if (socket && connectionState.isConnected) {
      socket.emit('typing_stop', { orderId });
    }
  }, [socket, connectionState.isConnected]);

  const sendPing = useCallback(() => {
    if (socket && connectionState.isConnected) {
      socket.emit('ping');
    }
  }, [socket, connectionState.isConnected]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearOrderUpdates = useCallback(() => {
    setOrderUpdates([]);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (userId && userName) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, userName]);

  // Ping server every 30 seconds to check connection
  useEffect(() => {
    if (connectionState.isConnected) {
      const pingInterval = setInterval(sendPing, 30000);
      return () => clearInterval(pingInterval);
    }
  }, [connectionState.isConnected, sendPing]);

  return {
    // Connection state
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    connectionError: connectionState.error,
    reconnectAttempts: connectionState.reconnectAttempts,
    
    // Data
    notifications,
    orderUpdates,
    systemStats,
    
    // Actions
    connect,
    disconnect,
    joinOrderRoom,
    leaveOrderRoom,
    sendTypingStart,
    sendTypingStop,
    sendPing,
    clearNotifications,
    clearOrderUpdates
  };
};

export default useWebSocket;
