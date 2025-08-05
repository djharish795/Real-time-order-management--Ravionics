import { PutCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, AWS_CONFIG } from '../config/aws';
import { Order } from '../models/Order';

export class DynamoService {
  private static instance: DynamoService;
  
  public static getInstance(): DynamoService {
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
  async createOrder(order: Order): Promise<void> {
    try {
      const command = new PutCommand({
        TableName: AWS_CONFIG.DYNAMODB_TABLE,
        Item: {
          ...order,
          ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year TTL
        },
        ConditionExpression: 'attribute_not_exists(orderId)', // Prevent duplicates
      });

      await docClient.send(command);
    } catch (error) {
      console.error('DynamoDB Create Error:', error);
      throw new Error('Failed to create order in database');
    }
  }

  /**
   * Get order by ID
   * Time Complexity: O(1) - Hash key lookup
   * Space Complexity: O(1) - Single item retrieval
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const command = new GetCommand({
        TableName: AWS_CONFIG.DYNAMODB_TABLE,
        Key: { orderId },
        ProjectionExpression: 'orderId, customerName, orderAmount, orderDate, invoiceFileUrl',
      });

      const result = await docClient.send(command);
      return result.Item as Order || null;
    } catch (error) {
      console.error('DynamoDB Get Error:', error);
      throw new Error('Failed to retrieve order');
    }
  }

  /**
   * Get all orders with pagination
   * Time Complexity: O(n) - Scan operation, optimized with pagination
   * Space Complexity: O(k) - Where k is the page size (limited to 100)
   */
  async getAllOrders(limit: number = 50, lastKey?: any): Promise<{ orders: Order[], lastEvaluatedKey?: any }> {
    try {
      const command = new ScanCommand({
        TableName: AWS_CONFIG.DYNAMODB_TABLE,
        Limit: Math.min(limit, 100), // Cap at 100 for performance
        ExclusiveStartKey: lastKey,
        ProjectionExpression: 'orderId, customerName, orderAmount, orderDate, invoiceFileUrl',
        FilterExpression: 'attribute_exists(orderId)', // Only valid orders
      });

      const result = await docClient.send(command);
      return {
        orders: (result.Items as Order[]) || [],
        lastEvaluatedKey: result.LastEvaluatedKey,
      };
    } catch (error) {
      console.error('DynamoDB Scan Error:', error);
      throw new Error('Failed to retrieve orders');
    }
  }
}
