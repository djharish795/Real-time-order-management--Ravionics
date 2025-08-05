"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoService = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const aws_1 = require("../config/aws");
class DynamoService {
    static getInstance() {
        if (!DynamoService.instance) {
            DynamoService.instance = new DynamoService();
        }
        return DynamoService.instance;
    }
    /**
     * Create new order in DynamoDB
     * Time Complexity: O(1) - Single item put
     * Space Complexity: O(1) - Single item storage
     */
    async createOrder(order) {
        try {
            const command = new lib_dynamodb_1.PutCommand({
                TableName: aws_1.AWS_CONFIG.DYNAMODB_TABLE,
                Item: {
                    ...order,
                    ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year TTL
                },
                ConditionExpression: 'attribute_not_exists(orderId)', // Prevent duplicates
            });
            await aws_1.docClient.send(command);
        }
        catch (error) {
            console.error('DynamoDB Create Error:', error);
            throw new Error('Failed to create order in database');
        }
    }
    /**
     * Get order by ID
     * Time Complexity: O(1) - Hash key lookup
     * Space Complexity: O(1) - Single item retrieval
     */
    async getOrderById(orderId) {
        try {
            const command = new lib_dynamodb_1.GetCommand({
                TableName: aws_1.AWS_CONFIG.DYNAMODB_TABLE,
                Key: { orderId },
                ProjectionExpression: 'orderId, customerName, orderAmount, orderDate, invoiceFileUrl',
            });
            const result = await aws_1.docClient.send(command);
            return result.Item || null;
        }
        catch (error) {
            console.error('DynamoDB Get Error:', error);
            throw new Error('Failed to retrieve order');
        }
    }
    /**
     * Get all orders with pagination
     * Time Complexity: O(n) - Scan operation, optimized with pagination
     * Space Complexity: O(k) - Where k is the page size (limited to 100)
     */
    async getAllOrders(limit = 50, lastKey) {
        try {
            const command = new lib_dynamodb_1.ScanCommand({
                TableName: aws_1.AWS_CONFIG.DYNAMODB_TABLE,
                Limit: Math.min(limit, 100), // Cap at 100 for performance
                ExclusiveStartKey: lastKey,
                ProjectionExpression: 'orderId, customerName, orderAmount, orderDate, invoiceFileUrl',
                FilterExpression: 'attribute_exists(orderId)', // Only valid orders
            });
            const result = await aws_1.docClient.send(command);
            return {
                orders: result.Items || [],
                lastEvaluatedKey: result.LastEvaluatedKey,
            };
        }
        catch (error) {
            console.error('DynamoDB Scan Error:', error);
            throw new Error('Failed to retrieve orders');
        }
    }
}
exports.DynamoService = DynamoService;
//# sourceMappingURL=dynamoService.js.map