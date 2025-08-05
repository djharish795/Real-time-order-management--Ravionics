import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';
import { CreateOrderRequest } from '../models/Order';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = OrderService.getInstance();
  }

  /**
   * @swagger
   * /orders:
   *   post:
   *     summary: Create a new order
   *     description: Create a new order with enhanced validation and real-time updates
   */
  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { customerName, orderAmount, customerEmail, items } = req.body;

      // Enhanced validation
      if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Customer name is required and must be at least 2 characters',
          code: 'INVALID_CUSTOMER_NAME'
        });
        return;
      }

      if (!orderAmount || typeof orderAmount !== 'number' || orderAmount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Order amount is required and must be greater than 0',
          code: 'INVALID_ORDER_AMOUNT'
        });
        return;
      }

      if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
          code: 'INVALID_EMAIL'
        });
        return;
      }

      // Process file upload if present
      let invoiceFile = req.file;
      
      const createRequest: CreateOrderRequest = {
        customerName: customerName.trim(),
        orderAmount: parseFloat(orderAmount.toString()),
        invoiceFile: invoiceFile!
      };

      const order = await this.orderService.createOrder(createRequest);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: order, // Frontend expects 'order' key
        metadata: {
          created: new Date().toISOString(),
          processing: true
        }
      });

    } catch (error) {
      console.error('Create Order Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'ORDER_CREATION_FAILED'
      });
    }
  };

  /**
   * @swagger
   * /orders/{orderId}:
   *   get:
   *     summary: Get order by ID
   *     description: Retrieve a specific order with detailed information
   */
  getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;

      if (!orderId || orderId.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required',
          code: 'MISSING_ORDER_ID'
        });
        return;
      }

      const order = await this.orderService.getOrderById(orderId);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Order retrieved successfully',
        order: order, // Frontend expects 'order' key
        metadata: {
          retrieved: new Date().toISOString(),
          cached: false
        }
      });

    } catch (error) {
      console.error('Get Order Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve order',
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'ORDER_RETRIEVAL_FAILED'
      });
    }
  };

  /**
   * @swagger
   * /orders:
   *   get:
   *     summary: Get all orders with advanced filtering
   *     description: Retrieve orders with pagination, filtering, and sorting
   */
  getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const lastKey = req.query.lastKey ? JSON.parse(req.query.lastKey as string) : undefined;
      
      // Enhanced filtering options
      const filters = {
        status: req.query.status as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        searchQuery: req.query.search as string
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof typeof filters]) {
          delete filters[key as keyof typeof filters];
        }
      });

      const result = await this.orderService.getAllOrders(limit, lastKey, filters);

      res.json({
        success: true,
        message: 'Orders retrieved successfully',
        orders: result.orders, // Frontend expects 'orders' key
        pagination: {
          hasMore: !!result.lastEvaluatedKey,
          lastKey: result.lastEvaluatedKey,
          count: result.orders.length,
          limit
        },
        filters: filters,
        metadata: {
          retrieved: new Date().toISOString(),
          totalFiltered: result.orders.length
        }
      });

    } catch (error) {
      console.error('Get Orders Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve orders',
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'ORDERS_RETRIEVAL_FAILED'
      });
    }
  };

  /**
   * @swagger
   * /orders/{orderId}:
   *   put:
   *     summary: Update an order
   *     description: Update order details with optimistic updates
   */
  updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;
      const updates = req.body;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required',
          code: 'MISSING_ORDER_ID'
        });
        return;
      }

      // Validate updates
      if (updates.orderAmount !== undefined) {
        const amount = parseFloat(updates.orderAmount);
        if (isNaN(amount) || amount <= 0) {
          res.status(400).json({
            success: false,
            message: 'Order amount must be a positive number',
            code: 'INVALID_ORDER_AMOUNT'
          });
          return;
        }
        updates.orderAmount = amount;
      }

      if (updates.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.customerEmail)) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid email address',
          code: 'INVALID_EMAIL'
        });
        return;
      }

      const updatedOrder = await this.orderService.updateOrder(orderId, updates);

      if (!updatedOrder) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Order updated successfully',
        order: updatedOrder,
        metadata: {
          updated: new Date().toISOString(),
          changes: Object.keys(updates)
        }
      });

    } catch (error) {
      console.error('Update Order Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update order',
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'ORDER_UPDATE_FAILED'
      });
    }
  };

  /**
   * @swagger
   * /orders/{orderId}:
   *   delete:
   *     summary: Delete an order
   *     description: Delete an order by ID
   */
  deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required',
          code: 'MISSING_ORDER_ID'
        });
        return;
      }

      const success = await this.orderService.deleteOrder(orderId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
          code: 'ORDER_NOT_FOUND'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Order deleted successfully',
        metadata: {
          deleted: new Date().toISOString(),
          orderId
        }
      });

    } catch (error) {
      console.error('Delete Order Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete order',
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'ORDER_DELETION_FAILED'
      });
    }
  };

  /**
   * @swagger
   * /analytics:
   *   get:
   *     summary: Get advanced analytics
   *     description: Retrieve comprehensive analytics and insights
   */
  getAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const analytics = await this.orderService.getAnalytics();

      res.json({
        success: true,
        message: 'Analytics retrieved successfully',
        analytics,
        metadata: {
          generated: new Date().toISOString(),
          type: 'comprehensive'
        }
      });

    } catch (error) {
      console.error('Analytics Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'ANALYTICS_FAILED'
      });
    }
  };

  /**
   * @swagger
   * /metrics:
   *   get:
   *     summary: Get real-time metrics
   *     description: Retrieve current system metrics and KPIs
   */
  getMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const metrics = await this.orderService.getMetrics();
      const realTimeStats = this.orderService.getRealTimeStats();

      res.json({
        success: true,
        message: 'Metrics retrieved successfully',
        metrics,
        realTimeStats,
        metadata: {
          generated: new Date().toISOString(),
          type: 'real-time'
        }
      });

    } catch (error) {
      console.error('Metrics Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve metrics',
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'METRICS_FAILED'
      });
    }
  };

  /**
   * @swagger
   * /orders/bulk/status:
   *   put:
   *     summary: Bulk update order status
   *     description: Update status for multiple orders
   */
  bulkUpdateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderIds, status } = req.body;

      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Order IDs array is required and cannot be empty',
          code: 'INVALID_ORDER_IDS'
        });
        return;
      }

      if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: pending, processing, completed, cancelled',
          code: 'INVALID_STATUS'
        });
        return;
      }

      const updatedOrders = await this.orderService.bulkUpdateStatus(orderIds, status);

      res.json({
        success: true,
        message: `Bulk updated ${updatedOrders.length} orders`,
        orders: updatedOrders,
        metadata: {
          updated: new Date().toISOString(),
          requestedCount: orderIds.length,
          successCount: updatedOrders.length
        }
      });

    } catch (error) {
      console.error('Bulk Update Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update orders',
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'BULK_UPDATE_FAILED'
      });
    }
  };

  /**
   * @swagger
   * /orders/export:
   *   get:
   *     summary: Export orders
   *     description: Export orders in various formats
   */
  exportOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const format = (req.query.format as string) || 'json';
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : undefined;

      if (!['json', 'csv'].includes(format)) {
        res.status(400).json({
          success: false,
          message: 'Invalid format. Supported formats: json, csv',
          code: 'INVALID_FORMAT'
        });
        return;
      }

      const exportData = await this.orderService.exportOrders(format as 'json' | 'csv', filters);

      const contentType = format === 'csv' ? 'text/csv' : 'application/json';
      const filename = `orders-export-${new Date().toISOString().split('T')[0]}.${format}`;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(exportData);

    } catch (error) {
      console.error('Export Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export orders',
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'EXPORT_FAILED'
      });
    }
  };
}
