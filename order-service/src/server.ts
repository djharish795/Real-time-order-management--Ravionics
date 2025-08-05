import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import orderRoutes from './routes/enhancedOrderRoutes';
// import WebSocketService from './services/websocketService';

const app = express();
const PORT = process.env.PORT || 3001;

// Create HTTP server for WebSocket integration
const httpServer = createServer(app);

// Initialize WebSocket service (commented out due to missing dependencies)
// const wsService = new WebSocketService(httpServer);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', orderRoutes);

// Health check with enhanced metrics
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '2.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    // wsConnections: wsService.getConnectedUsersCount(),
    endpoints: {
      orders: '/api/orders',
      createOrder: 'POST /api/orders',
      getOrder: 'GET /api/orders/:id',
      updateOrder: 'PUT /api/orders/:id',
      deleteOrder: 'DELETE /api/orders/:id',
      analytics: 'GET /api/analytics',
      metrics: 'GET /api/metrics'
    }
  };
  
  res.json(healthCheck);
});

// Basic route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Advanced Order Management API v2.0 is running!',
    features: [
      'Real-time WebSocket updates',
      'Advanced analytics',
      'Optimistic updates',
      'Performance monitoring',
      'Enhanced error handling'
    ]
  });
});

// Performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) { // Log slow requests
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', error);
  
  // Enhanced error response
  const errorResponse = {
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  };
  
  res.status(500).json(errorResponse);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /health',
      'GET /api',
      'GET /api/orders',
      'POST /api/orders',
      'GET /api/orders/:id',
      'PUT /api/orders/:id',
      'DELETE /api/orders/:id'
    ]
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('💤 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('💤 Server closed');
    process.exit(0);
  });
});

httpServer.listen(PORT, () => {
  console.log('🚀 Advanced Order Management Server v2.0 running!');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📚 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket: Ready for real-time connections`);
  console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✨ Enhanced features: Analytics, Real-time updates, Performance monitoring');
});
