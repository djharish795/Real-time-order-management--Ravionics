import { PublishCommand } from "@aws-sdk/client-sns";
import { snsClient, AWS_CONFIG } from '../config/aws';
import { Order } from '../models/Order';

export class SNSService {
  private static instance: SNSService;
  
  public static getInstance(): SNSService {
    if (!SNSService.instance) {
      SNSService.instance = new SNSService();
    }
    return SNSService.instance;
  }

  /**
   * Publish order creation notification
   * Time Complexity: O(1) - Single publish operation
   * Space Complexity: O(1) - Message payload
   */
  async publishOrderCreated(order: Order): Promise<void> {
    try {
      const message = {
        event: 'ORDER_CREATED',
        timestamp: new Date().toISOString(),
        order: {
          orderId: order.orderId,
          customerName: order.customerName,
          orderAmount: order.orderAmount,
          orderDate: order.orderDate,
        },
      };

      const command = new PublishCommand({
        TopicArn: AWS_CONFIG.SNS_TOPIC_ARN,
        Subject: `New Order Created - ${order.orderId}`,
        Message: JSON.stringify(message, null, 2),
        MessageAttributes: {
          orderId: {
            DataType: 'String',
            StringValue: order.orderId,
          },
          customerName: {
            DataType: 'String',
            StringValue: order.customerName,
          },
          orderAmount: {
            DataType: 'Number',
            StringValue: order.orderAmount.toString(),
          },
        },
      });

      await snsClient.send(command);
    } catch (error) {
      console.error('SNS Publish Error:', error);
      throw new Error('Failed to send notification');
    }
  }
}
