import { Order, CreateOrderRequest } from '../models/Order';
export declare class OrderService {
    private static instance;
    private constructor();
    static getInstance(): OrderService;
    /**
     * Create new order (Mock implementation)
     */
    createOrder(request: CreateOrderRequest): Promise<Order>;
    /**
     * Get order by ID (Mock implementation)
     */
    getOrderById(orderId: string): Promise<Order | null>;
    /**
     * Get all orders with pagination (Mock implementation)
     */
    getAllOrders(limit?: number, lastKey?: any): Promise<{
        orders: Order[];
        lastEvaluatedKey?: any;
    }>;
}
//# sourceMappingURL=orderService.d.ts.map