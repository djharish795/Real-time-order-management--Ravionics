export interface Order {
  orderId: string;           // UUID - Primary Key
  customerName: string;      // Customer name
  customerEmail?: string;    // Customer email (optional)
  orderAmount: number;       // Order amount (Double precision)
  orderDate: string;         // ISO Timestamp
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  invoiceFile?: string;      // S3 URL for invoice PDF
  invoiceFileUrl?: string;   // Alternative field name for compatibility
  items?: Array<{           // Optional order items
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface CreateOrderRequest {
  customerName: string;
  orderAmount: number;
  invoiceFile: Express.Multer.File;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data?: Order | Order[];
  error?: string;
}
