import { Order } from '../models/Order';
export declare class SNSService {
    private static instance;
    static getInstance(): SNSService;
    /**
     * Publish order creation notification
     * Time Complexity: O(1) - Single publish operation
     * Space Complexity: O(1) - Message payload
     */
    publishOrderCreated(order: Order): Promise<void>;
}
//# sourceMappingURL=snsService.d.ts.map