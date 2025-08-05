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
   *     summary: Create new order
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - in: formData
   *         name: customerName
   *         type: string
   *         required: true
   *       - in: formData
   *         name: orderAmount
   *         type: number
   *         required: true
   *       - in: formData
   *         name: invoiceFile
   *         type: file
   *         required: true
   */
  createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const createRequest: CreateOrderRequest = {
        customerName: req.body.customerName,
        orderAmount: parseFloat(req.body.orderAmount),
        invoiceFile: req.file!,
      };

      const order = await this.orderService.createOrder(createRequest);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: order, // Frontend expects 'order' key
      });
    } catch (error) {
      console.error('Create Order Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * @swagger
   * /orders/{id}:
   *   get:
   *     summary: Get order by ID
   */
  getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);

      if (!order) {
        res.status(404).json({
          success: false,
          message: 'Order not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Order retrieved successfully',
        order: order, // Frontend expects 'order' key
      });
    } catch (error) {
      console.error('Get Order Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve order',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * @swagger
   * /orders:
   *   get:
   *     summary: Get all orders
   */
  getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const lastKey = req.query.lastKey ? JSON.parse(req.query.lastKey as string) : undefined;

      const result = await this.orderService.getAllOrders(limit, lastKey);

      res.json({
        success: true,
        message: 'Orders retrieved successfully',
        orders: result.orders, // Frontend expects 'orders' key
        pagination: {
          hasMore: !!result.lastEvaluatedKey,
          lastKey: result.lastEvaluatedKey,
        },
      });
    } catch (error) {
      console.error('Get Orders Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve orders',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
