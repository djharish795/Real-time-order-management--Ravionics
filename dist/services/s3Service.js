"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const aws_1 = require("../config/aws");
const uuid_1 = require("uuid");
class S3Service {
    // Singleton pattern for optimal memory usage
    static getInstance() {
        if (!S3Service.instance) {
            S3Service.instance = new S3Service();
        }
        return S3Service.instance;
    }
    /**
     * Upload invoice PDF to S3
     * Time Complexity: O(1) - Single upload operation
     * Space Complexity: O(1) - Streams file data
     */
    async uploadInvoice(file, orderId) {
        try {
            const fileKey = `invoices/${orderId}/${(0, uuid_1.v4)()}-${file.originalname}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: aws_1.AWS_CONFIG.S3_BUCKET,
                Key: fileKey,
                Body: file.buffer,
                ContentType: file.mimetype,
                Metadata: {
                    orderId: orderId,
                    uploadedAt: new Date().toISOString(),
                },
            });
            await aws_1.s3Client.send(command);
            // Return public URL
            return `https://${aws_1.AWS_CONFIG.S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;
        }
        catch (error) {
            console.error('S3 Upload Error:', error);
            throw new Error('Failed to upload invoice to S3');
        }
    }
    /**
     * Generate pre-signed URL for secure download
     * Time Complexity: O(1)
     * Space Complexity: O(1)
     */
    async generatePresignedUrl(fileKey, expiresIn = 3600) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: aws_1.AWS_CONFIG.S3_BUCKET,
                Key: fileKey,
            });
            return await (0, s3_request_presigner_1.getSignedUrl)(aws_1.s3Client, command, { expiresIn });
        }
        catch (error) {
            console.error('Pre-signed URL Error:', error);
            throw new Error('Failed to generate download URL');
        }
    }
}
exports.S3Service = S3Service;
//# sourceMappingURL=s3Service.js.map