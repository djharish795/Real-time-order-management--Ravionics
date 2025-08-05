"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const uuid_1 = require("uuid");
// Mock data store for development
const mockOrders = [
    {
        orderId: 'order-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        orderAmount: 150.99,
        orderDate: new Date().toISOString(),
        status: 'completed',
        invoiceFile: 'https://example.com/invoice1.pdf',
        items: [
            { id: '1', name: 'Product A', quantity: 2, price: 75.50 }
        ]
    },
    {
        orderId: 'order-2',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        orderAmount: 89.50,
        orderDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'processing',
        invoiceFile: 'https://example.com/invoice2.pdf',
        items: [
            { id: '2', name: 'Product B', quantity: 1, price: 89.50 }
        ]
    },
    {
        orderId: 'order-3',
        customerName: 'Bob Wilson',
        customerEmail: 'bob@example.com',
        orderAmount: 245.75,
        orderDate: new Date(Date.now() - 172800000).toISOString(),
        status: 'pending',
        invoiceFile: 'https://example.com/invoice3.pdf',
        items: [
            { id: '3', name: 'Product C', quantity: 3, price: 81.92 }
        ]
    }
];
class OrderService {
    constructor() {
        // Mock service - no AWS dependencies for development
    }
    static getInstance() {
        if (!OrderService.instance) {
            OrderService.instance = new OrderService();
        }
        return OrderService.instance;
    }
    /**
     * Create new order (Mock implementation)
     */
    async createOrder(request) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const orderId = (0, uuid_1.v4)();
        const order = {
            orderId,
            customerName: request.customerName,
            customerEmail: `${request.customerName.toLowerCase().replace(' ', '.')}@example.com`,
            orderAmount: request.orderAmount,
            orderDate: new Date().toISOString(),
            status: 'pending',
            invoiceFile: `https://mock-s3.com/invoices/${orderId}/${request.invoiceFile.originalname}`,
            items: [
                {
                    id: (0, uuid_1.v4)(),
                    name: 'Sample Product',
                    quantity: 1,
                    price: request.orderAmount
                }
            ]
        };
        // Add to mock store
        mockOrders.unshift(order);
        console.log(`✅ Mock order created: ${orderId}`);
        return order;
    }
    /**
     * Get order by ID (Mock implementation)
     */
    async getOrderById(orderId) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        const order = mockOrders.find(o => o.orderId === orderId);
        console.log(`📖 Fetching order: ${orderId}, Found: ${!!order}`);
        return order || null;
    }
    /**
     * Get all orders with pagination (Mock implementation)
     */
    async getAllOrders(limit = 50, lastKey) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`📋 Fetching ${limit} orders, Total available: ${mockOrders.length}`);
        // Simple pagination simulation
        const startIndex = lastKey ? parseInt(lastKey.index) : 0;
        const endIndex = Math.min(startIndex + limit, mockOrders.length);
        const orders = mockOrders.slice(startIndex, endIndex);
        const hasMore = endIndex < mockOrders.length;
        const result = {
            orders,
            lastEvaluatedKey: hasMore ? { index: endIndex } : undefined
        };
        return result;
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=orderService.js.map