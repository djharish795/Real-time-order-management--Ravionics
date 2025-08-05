import { Request, Response } from 'express';
export declare class OrderController {
    private orderService;
    constructor();
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
    createOrder: (req: Request, res: Response) => Promise<void>;
    /**
     * @swagger
     * /orders/{id}:
     *   get:
     *     summary: Get order by ID
     */
    getOrderById: (req: Request, res: Response) => Promise<void>;
    /**
     * @swagger
     * /orders:
     *   get:
     *     summary: Get all orders
     */
    getAllOrders: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=orderController.d.ts.map