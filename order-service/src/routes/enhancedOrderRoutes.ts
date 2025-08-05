import express from 'express';
import multer from 'multer';
import { OrderController } from '../controllers/enhancedOrderController';

const router = express.Router();
const orderController = new OrderController();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
    }
  },
});

// Enhanced Order Routes

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     description: Create a new order with file upload support and enhanced validation
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: customerName
 *         type: string
 *         required: true
 *         description: Customer's full name
 *       - in: formData
 *         name: orderAmount
 *         type: number
 *         required: true
 *         description: Total order amount
 *       - in: formData
 *         name: customerEmail
 *         type: string
 *         required: false
 *         description: Customer's email address
 *       - in: formData
 *         name: invoiceFile
 *         type: file
 *         required: false
 *         description: Invoice PDF file
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/orders', upload.single('invoiceFile'), orderController.createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders with filtering
 *     description: Retrieve orders with pagination, filtering, and search capabilities
 *     parameters:
 *       - in: query
 *         name: limit
 *         type: integer
 *         description: Number of orders to return (default 50)
 *       - in: query
 *         name: lastKey
 *         type: string
 *         description: Pagination key for next page
 *       - in: query
 *         name: status
 *         type: string
 *         enum: [pending, processing, completed, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: startDate
 *         type: string
 *         format: date
 *         description: Filter orders from this date
 *       - in: query
 *         name: endDate
 *         type: string
 *         format: date
 *         description: Filter orders until this date
 *       - in: query
 *         name: search
 *         type: string
 *         description: Search in customer name, email, or order ID
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/orders', orderController.getAllOrders);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve detailed information about a specific order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         type: string
 *         required: true
 *         description: Unique order identifier
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get('/orders/:orderId', orderController.getOrderById);

/**
 * @swagger
 * /orders/{orderId}:
 *   put:
 *     summary: Update an order
 *     description: Update order details with optimistic updates
 *     parameters:
 *       - in: path
 *         name: orderId
 *         type: string
 *         required: true
 *         description: Unique order identifier
 *       - in: body
 *         name: updates
 *         description: Order fields to update
 *         schema:
 *           type: object
 *           properties:
 *             customerName:
 *               type: string
 *             customerEmail:
 *               type: string
 *             orderAmount:
 *               type: number
 *             status:
 *               type: string
 *               enum: [pending, processing, completed, cancelled]
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.put('/orders/:orderId', orderController.updateOrder);

/**
 * @swagger
 * /orders/{orderId}:
 *   delete:
 *     summary: Delete an order
 *     description: Permanently delete an order from the system
 *     parameters:
 *       - in: path
 *         name: orderId
 *         type: string
 *         required: true
 *         description: Unique order identifier
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.delete('/orders/:orderId', orderController.deleteOrder);

/**
 * @swagger
 * /analytics:
 *   get:
 *     summary: Get comprehensive analytics
 *     description: Retrieve detailed analytics including trends, distributions, and insights
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/analytics', orderController.getAnalytics);

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get real-time metrics
 *     description: Retrieve current system metrics and KPIs
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get('/metrics', orderController.getMetrics);

/**
 * @swagger
 * /orders/bulk/status:
 *   put:
 *     summary: Bulk update order status
 *     description: Update status for multiple orders simultaneously
 *     parameters:
 *       - in: body
 *         name: bulkUpdate
 *         description: Bulk update parameters
 *         schema:
 *           type: object
 *           required:
 *             - orderIds
 *             - status
 *           properties:
 *             orderIds:
 *               type: array
 *               items:
 *                 type: string
 *               description: Array of order IDs to update
 *             status:
 *               type: string
 *               enum: [pending, processing, completed, cancelled]
 *               description: New status for all orders
 *     responses:
 *       200:
 *         description: Orders updated successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.put('/orders/bulk/status', orderController.bulkUpdateStatus);

/**
 * @swagger
 * /orders/export:
 *   get:
 *     summary: Export orders
 *     description: Export orders in various formats (JSON, CSV)
 *     parameters:
 *       - in: query
 *         name: format
 *         type: string
 *         enum: [json, csv]
 *         default: json
 *         description: Export format
 *       - in: query
 *         name: filters
 *         type: string
 *         description: JSON string of filters to apply
 *     responses:
 *       200:
 *         description: Export file generated successfully
 *       400:
 *         description: Invalid format
 *       500:
 *         description: Internal server error
 */
router.get('/orders/export', orderController.exportOrders);

// Middleware for handling file upload errors
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
        code: 'FILE_TOO_LARGE'
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: error.message,
      code: 'UPLOAD_ERROR'
    });
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: 'INVALID_FILE_TYPE'
    });
  }
  
  next(error);
});

export default router;
