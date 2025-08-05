"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SNSService = void 0;
const client_sns_1 = require("@aws-sdk/client-sns");
const aws_1 = require("../config/aws");
class SNSService {
    static getInstance() {
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
    async publishOrderCreated(order) {
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
            const command = new client_sns_1.PublishCommand({
                TopicArn: aws_1.AWS_CONFIG.SNS_TOPIC_ARN,
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
            await aws_1.snsClient.send(command);
        }
        catch (error) {
            console.error('SNS Publish Error:', error);
            throw new Error('Failed to send notification');
        }
    }
}
exports.SNSService = SNSService;
//# sourceMappingURL=snsService.js.map