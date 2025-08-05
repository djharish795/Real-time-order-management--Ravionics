export interface Order {
    orderId: string;
    customerName: string;
    customerEmail?: string;
    orderAmount: number;
    orderDate: string;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    invoiceFile?: string;
    invoiceFileUrl?: string;
    items?: Array<{
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
//# sourceMappingURL=Order.d.ts.map