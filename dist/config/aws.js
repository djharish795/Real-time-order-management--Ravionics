"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS_CONFIG = exports.snsClient = exports.s3Client = exports.docClient = exports.dynamoClient = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_s3_1 = require("@aws-sdk/client-s3");
const client_sns_1 = require("@aws-sdk/client-sns");
// Optimized AWS clients with connection pooling
exports.dynamoClient = new client_dynamodb_1.DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    maxAttempts: 3,
    requestHandler: {
        requestTimeout: 3000,
        httpsAgent: {
            maxSockets: 50, // Connection pooling optimization
        },
    },
});
exports.docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(exports.dynamoClient, {
    marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true,
    },
});
exports.s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    maxAttempts: 3,
    requestHandler: {
        requestTimeout: 30000,
        httpsAgent: {
            maxSockets: 50,
        },
    },
});
exports.snsClient = new client_sns_1.SNSClient({
    region: process.env.AWS_REGION || 'us-east-1',
    maxAttempts: 3,
    requestHandler: {
        requestTimeout: 5000,
        httpsAgent: {
            maxSockets: 25,
        },
    },
});
// Environment variables
exports.AWS_CONFIG = {
    DYNAMODB_TABLE: process.env.DYNAMODB_TABLE_NAME || 'orders',
    S3_BUCKET: process.env.S3_BUCKET_NAME || 'order-management-invoices',
    SNS_TOPIC_ARN: process.env.SNS_TOPIC_ARN || '',
};
//# sourceMappingURL=aws.js.map