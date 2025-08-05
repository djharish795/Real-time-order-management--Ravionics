import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { SNSClient } from "@aws-sdk/client-sns";

// Optimized AWS clients with connection pooling
export const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  maxAttempts: 3,
  requestHandler: {
    requestTimeout: 3000,
    httpsAgent: {
      maxSockets: 50, // Connection pooling optimization
    },
  },
});

export const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true,
  },
});

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  maxAttempts: 3,
  requestHandler: {
    requestTimeout: 30000,
    httpsAgent: {
      maxSockets: 50,
    },
  },
});

export const snsClient = new SNSClient({
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
export const AWS_CONFIG = {
  DYNAMODB_TABLE: process.env.DYNAMODB_TABLE_NAME || 'orders',
  S3_BUCKET: process.env.S3_BUCKET_NAME || 'order-management-invoices',
  SNS_TOPIC_ARN: process.env.SNS_TOPIC_ARN || '',
} as const;
