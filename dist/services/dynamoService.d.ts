import { Order } from '../models/Order';
export declare class DynamoService {
    private static instance;
    static getInstance(): DynamoService;
    /**
     * Create new order in DynamoDB
     * Time Complexity: O(1) - Single item put
     * Space Complexity: O(1) - Single item storage
     */
    createOrder(order: Order): Promise<void>;
    /**
     * Get order by ID
     * Time Complexity: O(1) - Hash key lookup
     * Space Complexity: O(1) - Single item retrieval
     */
    getOrderById(orderId: string): Promise<Order | null>;
    /**
     * Get all orders with pagination
     * Time Complexity: O(n) - Scan operation, optimized with pagination
     * Space Complexity: O(k) - Where k is the page size (limited to 100)
     */
    getAllOrders(limit?: number, lastKey?: any): Promise<{
        orders: Order[];
        lastEvaluatedKey?: any;
    }>;
}
//# sourceMappingURL=dynamoService.d.ts.map