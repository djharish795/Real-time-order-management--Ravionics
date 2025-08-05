import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface Order {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderAmount: number;
  orderDate: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  invoiceFile?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/orders`);
      setOrders(response.data.orders || []);
      setHasMore(false); // For simplicity, assuming all orders are loaded
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreOrders = async () => {
    // Implementation for pagination if needed
    console.log('Load more orders');
  };

  const createOrder = async (orderData: Partial<Order>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/api/orders`, orderData);
      setOrders(prev => [response.data.order, ...prev]);
      return response.data.order;
    } catch (err) {
      setError('Failed to create order. Please try again.');
      console.error('Error creating order:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOrder = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`);
      return response.data.order;
    } catch (err) {
      setError('Failed to fetch order details. Please try again.');
      console.error('Error fetching order:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    hasMore,
    fetchOrders,
    loadMoreOrders,
    createOrder,
    getOrder
  };
};
