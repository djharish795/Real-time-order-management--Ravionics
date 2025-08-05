import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { SNSClient } from "@aws-sdk/client-sns";
export declare const dynamoClient: DynamoDBClient;
export declare const docClient: DynamoDBDocumentClient;
export declare const s3Client: S3Client;
export declare const snsClient: SNSClient;
export declare const AWS_CONFIG: {
    readonly DYNAMODB_TABLE: string;
    readonly S3_BUCKET: string;
    readonly SNS_TOPIC_ARN: string;
};
//# sourceMappingURL=aws.d.ts.map