export declare class S3Service {
    private static instance;
    static getInstance(): S3Service;
    /**
     * Upload invoice PDF to S3
     * Time Complexity: O(1) - Single upload operation
     * Space Complexity: O(1) - Streams file data
     */
    uploadInvoice(file: Express.Multer.File, orderId: string): Promise<string>;
    /**
     * Generate pre-signed URL for secure download
     * Time Complexity: O(1)
     * Space Complexity: O(1)
     */
    generatePresignedUrl(fileKey: string, expiresIn?: number): Promise<string>;
}
//# sourceMappingURL=s3Service.d.ts.map