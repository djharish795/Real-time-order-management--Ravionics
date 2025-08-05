import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category?: string;
  sku?: string;
}

export interface Order {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  orderAmount: number;
  orderDate: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  invoiceFile?: string;
  items?: OrderItem[];
}

export interface CreateOrderData {
  customerName: string;
  customerEmail: string;
  orderAmount: number;
  items: OrderItem[];
  invoiceFile?: File;
}

export class OrderService {
  static async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const formData = new FormData();
      formData.append('customerName', orderData.customerName);
      formData.append('customerEmail', orderData.customerEmail);
      formData.append('orderAmount', orderData.orderAmount.toString());
      formData.append('items', JSON.stringify(orderData.items));
      
      if (orderData.invoiceFile) {
        formData.append('invoiceFile', orderData.invoiceFile);
      }

      const response = await axios.post(`${API_BASE_URL}/api/orders`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.order;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to create order';
      throw new Error(message);
    }
  }

  static async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`);
      return response.data.order;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch order';
      throw new Error(message);
    }
  }

  static async getAllOrders(): Promise<Order[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/orders`);
      return response.data.orders || [];
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch orders';
      throw new Error(message);
    }
  }

  static async updateOrder(orderId: string, updateData: Partial<Order>): Promise<Order> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/orders/${orderId}`, updateData);
      return response.data.order;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to update order';
      throw new Error(message);
    }
  }

  static async deleteOrder(orderId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/orders/${orderId}`);
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to delete order';
      throw new Error(message);
    }
  }
}
