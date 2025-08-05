import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

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

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Socket> = new Map();
  private userSessions: Map<string, { userId: string; connectedAt: Date }> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://your-frontend-domain.com']
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle user authentication/identification
      socket.on('authenticate', (userData: { userId: string; name: string }) => {
        this.connectedUsers.set(socket.id, socket);
        this.userSessions.set(socket.id, {
          userId: userData.userId,
          connectedAt: new Date()
        });

        socket.join('authenticated_users');
        console.log(`✅ User authenticated: ${userData.name} (${userData.userId})`);

        // Send welcome notification
        this.sendNotificationToUser(socket.id, {
          id: uuidv4(),
          title: 'Connected Successfully',
          message: `Welcome back, ${userData.name}! You're now receiving real-time updates.`,
          type: 'success',
          timestamp: new Date().toISOString()
        });

        // Send current system stats
        this.sendSystemStats(socket.id);
      });

      // Handle joining order-specific rooms
      socket.on('join_order_room', (orderId: string) => {
        socket.join(`order_${orderId}`);
        console.log(`📋 Socket ${socket.id} joined order room: ${orderId}`);
      });

      // Handle leaving order-specific rooms
      socket.on('leave_order_room', (orderId: string) => {
        socket.leave(`order_${orderId}`);
        console.log(`📤 Socket ${socket.id} left order room: ${orderId}`);
      });

      // Handle typing indicators for comments/notes
      socket.on('typing_start', (data: { orderId: string; userName: string }) => {
        socket.to(`order_${data.orderId}`).emit('user_typing', {
          userName: data.userName,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('typing_stop', (data: { orderId: string }) => {
        socket.to(`order_${data.orderId}`).emit('user_stopped_typing');
      });

      // Handle ping for connection health
      socket.on('ping', () => {
        socket.emit('pong', {
          timestamp: new Date().toISOString(),
          serverTime: Date.now()
        });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`🔌 Client disconnected: ${socket.id}, Reason: ${reason}`);
        this.connectedUsers.delete(socket.id);
        this.userSessions.delete(socket.id);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
      });
    });
  }

  // Broadcast order updates to all connected clients
  public broadcastOrderUpdate(orderUpdate: OrderUpdate): void {
    console.log(`📢 Broadcasting order update: ${orderUpdate.orderId}`);
    
    // Send to all authenticated users
    this.io.to('authenticated_users').emit('order_update', orderUpdate);

    // Send detailed update to users watching specific order
    this.io.to(`order_${orderUpdate.orderId}`).emit('order_detail_update', {
      ...orderUpdate,
      detailedInfo: true
    });

    // Create notification for the update
    const notification: NotificationMessage = {
      id: uuidv4(),
      title: `Order ${orderUpdate.type.replace('_', ' ').toUpperCase()}`,
      message: `Order ${orderUpdate.orderId.split('-')[0]}... has been ${orderUpdate.type.replace('_', ' ')}`,
      type: orderUpdate.type === 'created' ? 'success' : 
            orderUpdate.type === 'deleted' ? 'warning' : 'info',
      timestamp: new Date().toISOString(),
      orderId: orderUpdate.orderId
    };

    this.broadcastNotification(notification);
  }

  // Send notification to all users
  public broadcastNotification(notification: NotificationMessage): void {
    console.log(`🔔 Broadcasting notification: ${notification.title}`);
    this.io.to('authenticated_users').emit('notification', notification);
  }

  // Send notification to specific user
  public sendNotificationToUser(socketId: string, notification: NotificationMessage): void {
    const socket = this.connectedUsers.get(socketId);
    if (socket) {
      socket.emit('notification', notification);
    }
  }

  // Send system statistics
  private sendSystemStats(socketId: string): void {
    const socket = this.connectedUsers.get(socketId);
    if (socket) {
      const stats = {
        connectedUsers: this.connectedUsers.size,
        totalSessions: this.userSessions.size,
        serverUptime: process.uptime(),
        timestamp: new Date().toISOString()
      };
      socket.emit('system_stats', stats);
    }
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Send bulk updates (for batch operations)
  public broadcastBulkUpdate(updates: OrderUpdate[]): void {
    console.log(`📦 Broadcasting bulk updates: ${updates.length} orders`);
    this.io.to('authenticated_users').emit('bulk_order_update', updates);
  }

  // Send real-time metrics
  public broadcastMetrics(metrics: any): void {
    this.io.to('authenticated_users').emit('metrics_update', {
      ...metrics,
      timestamp: new Date().toISOString()
    });
  }

  // Emergency broadcast
  public emergencyBroadcast(message: string, type: 'maintenance' | 'alert' | 'update'): void {
    const notification: NotificationMessage = {
      id: uuidv4(),
      title: 'System Alert',
      message,
      type: 'warning',
      timestamp: new Date().toISOString()
    };

    this.io.emit('emergency_notification', { ...notification, emergencyType: type });
  }
}

export default WebSocketService;
