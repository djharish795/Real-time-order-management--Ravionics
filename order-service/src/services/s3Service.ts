import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, AWS_CONFIG } from '../config/aws';
import { v4 as uuidv4 } from 'uuid';

export class S3Service {
  private static instance: S3Service;
  
  // Singleton pattern for optimal memory usage
  public static getInstance(): S3Service {
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
  async uploadInvoice(file: Express.Multer.File, orderId: string): Promise<string> {
    try {
      const fileKey = `invoices/${orderId}/${uuidv4()}-${file.originalname}`;
      
      const command = new PutObjectCommand({
        Bucket: AWS_CONFIG.S3_BUCKET,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          orderId: orderId,
          uploadedAt: new Date().toISOString(),
        },
      });

      await s3Client.send(command);
      
      // Return public URL
      return `https://${AWS_CONFIG.S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new Error('Failed to upload invoice to S3');
    }
  }

  /**
   * Generate pre-signed URL for secure download
   * Time Complexity: O(1)
   * Space Complexity: O(1)
   */
  async generatePresignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: AWS_CONFIG.S3_BUCKET,
        Key: fileKey,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Pre-signed URL Error:', error);
      throw new Error('Failed to generate download URL');
    }
  }
}
