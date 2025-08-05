import { v4 as uuidv4 } from 'uuid';
import { Order, CreateOrderRequest } from '../models/Order';

// Advanced analytics and metrics
interface OrderMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  orderCount: number;
  conversionRate: number;
  customerSatisfaction: number;
}

interface OrderAnalytics {
  dailyStats: Array<{ date: string; orders: number; revenue: number }>;
  statusDistribution: Record<string, number>;
  revenueByPeriod: Array<{ period: string; revenue: number }>;
  topCustomers: Array<{ name: string; totalSpent: number; orderCount: number }>;
}

// Enhanced mock data store with analytics
class OrderDataStore {
  private orders: Order[] = [];
  private metrics: OrderMetrics = {
    totalRevenue: 0,
    averageOrderValue: 0,
    orderCount: 0,
    conversionRate: 68.5,
    customerSatisfaction: 94.2
  };

  constructor() {
    this.initializeMockData();
    this.calculateMetrics();
  }

  private initializeMockData() {
    this.orders = [
      {
        orderId: 'order-1',
        customerName: 'John Doe',
        customerEmail: 'djharish795@gmail.com',
        orderAmount: 150.99,
        orderDate: new Date().toISOString(),
        status: 'completed',
        invoiceFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        invoiceFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        items: [
          { id: '1', name: 'Laptop Computer', quantity: 1, price: 150.99 }
        ]
      },
      {
        orderId: 'order-2',
        customerName: 'Jane Smith',
        customerEmail: 'djharish795@gmail.com',
        orderAmount: 89.50,
        orderDate: new Date(Date.now() - 86400000).toISOString(),
        status: 'processing',
        invoiceFile: 'https://www.africau.edu/images/default/sample.pdf',
        invoiceFileUrl: 'https://www.africau.edu/images/default/sample.pdf',
        items: [
          { id: '2', name: 'Wireless Mouse', quantity: 2, price: 44.75 }
        ]
      },
      {
        orderId: 'order-3',
        customerName: 'Bob Wilson',
        customerEmail: 'djharish795@gmail.com',
        orderAmount: 245.75,
        orderDate: new Date(Date.now() - 172800000).toISOString(),
        status: 'pending',
        invoiceFile: 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf',
        invoiceFileUrl: 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf',
        items: [
          { id: '3', name: 'Office Chair', quantity: 1, price: 245.75 }
        ]
      }
    ];
  }

  private calculateMetrics() {
    this.metrics.orderCount = this.orders.length;
    this.metrics.totalRevenue = this.orders.reduce((sum, order) => sum + order.orderAmount, 0);
    this.metrics.averageOrderValue = this.metrics.totalRevenue / this.metrics.orderCount;
  }

  getOrders(): Order[] {
    return [...this.orders];
  }

  addOrder(order: Order): void {
    this.orders.unshift(order);
    this.calculateMetrics();
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find(order => order.orderId === id);
  }

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    const index = this.orders.findIndex(order => order.orderId === id);
    if (index === -1) return null;
    
    this.orders[index] = { ...this.orders[index], ...updates };
    this.calculateMetrics();
    return this.orders[index];
  }

  deleteOrder(id: string): boolean {
    const initialLength = this.orders.length;
    this.orders = this.orders.filter(order => order.orderId !== id);
    if (this.orders.length < initialLength) {
      this.calculateMetrics();
      return true;
    }
    return false;
  }

  getMetrics(): OrderMetrics {
    return { ...this.metrics };
  }

  getAnalytics(): OrderAnalytics {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();

    const dailyStats = last7Days.map(date => {
      const dayOrders = this.orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate.toDateString() === date.toDateString();
      });
      return {
        date: date.toISOString().split('T')[0],
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + order.orderAmount, 0)
      };
    });

    const statusDistribution = this.orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const customerStats = this.orders.reduce((acc, order) => {
      if (!acc[order.customerName]) {
        acc[order.customerName] = { totalSpent: 0, orderCount: 0 };
      }
      acc[order.customerName].totalSpent += order.orderAmount;
      acc[order.customerName].orderCount += 1;
      return acc;
    }, {} as Record<string, { totalSpent: number; orderCount: number }>);

    const topCustomers = Object.entries(customerStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    return {
      dailyStats,
      statusDistribution,
      revenueByPeriod: dailyStats.map(stat => ({ period: stat.date, revenue: stat.revenue })),
      topCustomers
    };
  }

  searchOrders(query: string): Order[] {
    const lowerQuery = query.toLowerCase();
    return this.orders.filter(order => 
      order.customerName.toLowerCase().includes(lowerQuery) ||
      order.customerEmail?.toLowerCase().includes(lowerQuery) ||
      order.orderId.toLowerCase().includes(lowerQuery) ||
      order.status.toLowerCase().includes(lowerQuery)
    );
  }

  getOrdersByStatus(status: string): Order[] {
    return this.orders.filter(order => order.status === status);
  }

  getOrdersByDateRange(startDate: Date, endDate: Date): Order[] {
    return this.orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }
}

export class OrderService {
  private static instance: OrderService;
  private dataStore: OrderDataStore;
  private eventListeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.dataStore = new OrderDataStore();
  }

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  // Event system for real-time updates
  addEventListener(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  removeEventListener(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  /**
   * Create new order with enhanced features
   */
  async createOrder(request: CreateOrderRequest): Promise<Order> {
    // Simulate API delay with progress updates
    await this.simulateProgress('Creating order...', 1000);

    const orderId = uuidv4();
    const order: Order = {
      orderId,
      customerName: request.customerName,
      customerEmail: 'djharish795@gmail.com',
      orderAmount: request.orderAmount,
      orderDate: new Date().toISOString(),
      status: 'pending',
      invoiceFile: `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`,
      invoiceFileUrl: `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`,
      items: [
        {
          id: uuidv4(),
          name: 'Sample Product',
          quantity: 1,
          price: request.orderAmount
        }
      ]
    };

    this.dataStore.addOrder(order);
    
    // Emit events for real-time updates
    this.emit('orderCreated', order);
    this.emit('metricsUpdated', this.dataStore.getMetrics());

    console.log(`✅ Enhanced order created: ${orderId}`);
    return order;
  }

  /**
   * Get order by ID with caching
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    await this.simulateProgress('Fetching order details...', 300);

    const order = this.dataStore.getOrderById(orderId);
    console.log(`📖 Fetching order: ${orderId}, Found: ${!!order}`);
    
    if (order) {
      this.emit('orderViewed', order);
    }
    
    return order || null;
  }

  /**
   * Get all orders with advanced filtering and sorting
   */
  async getAllOrders(
    limit: number = 50, 
    lastKey?: any,
    filters?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      searchQuery?: string;
    }
  ): Promise<{ orders: Order[], lastEvaluatedKey?: any }> {
    await this.simulateProgress('Loading orders...', 500);

    let orders = this.dataStore.getOrders();

    // Apply filters
    if (filters) {
      if (filters.status) {
        orders = orders.filter(order => order.status === filters.status);
      }
      
      if (filters.startDate && filters.endDate) {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        orders = orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }
      
      if (filters.searchQuery) {
        orders = this.dataStore.searchOrders(filters.searchQuery);
      }
    }

    // Apply pagination
    const startIndex = lastKey ? parseInt(lastKey.index) : 0;
    const endIndex = Math.min(startIndex + limit, orders.length);
    const paginatedOrders = orders.slice(startIndex, endIndex);
    
    const hasMore = endIndex < orders.length;
    const result = {
      orders: paginatedOrders,
      lastEvaluatedKey: hasMore ? { index: endIndex } : undefined
    };

    console.log(`📋 Advanced query - Found: ${orders.length}, Returned: ${paginatedOrders.length}`);
    return result;
  }

  /**
   * Update order with optimistic updates
   */
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order | null> {
    await this.simulateProgress('Updating order...', 800);

    const updatedOrder = this.dataStore.updateOrder(orderId, updates);
    
    if (updatedOrder) {
      this.emit('orderUpdated', updatedOrder);
      this.emit('metricsUpdated', this.dataStore.getMetrics());
      console.log(`🔄 Order updated: ${orderId}`);
    }

    return updatedOrder;
  }

  /**
   * Delete order
   */
  async deleteOrder(orderId: string): Promise<boolean> {
    await this.simulateProgress('Deleting order...', 600);

    const success = this.dataStore.deleteOrder(orderId);
    
    if (success) {
      this.emit('orderDeleted', { orderId });
      this.emit('metricsUpdated', this.dataStore.getMetrics());
      console.log(`🗑️ Order deleted: ${orderId}`);
    }

    return success;
  }

  /**
   * Get advanced analytics
   */
  async getAnalytics(): Promise<OrderAnalytics> {
    await this.simulateProgress('Generating analytics...', 400);
    return this.dataStore.getAnalytics();
  }

  /**
   * Get metrics
   */
  async getMetrics(): Promise<OrderMetrics> {
    await this.simulateProgress('Calculating metrics...', 200);
    return this.dataStore.getMetrics();
  }

  /**
   * Bulk operations
   */
  async bulkUpdateStatus(orderIds: string[], status: Order['status']): Promise<Order[]> {
    await this.simulateProgress('Bulk updating orders...', 1500);

    const updatedOrders: Order[] = [];
    for (const orderId of orderIds) {
      const updated = this.dataStore.updateOrder(orderId, { status });
      if (updated) {
        updatedOrders.push(updated);
      }
    }

    if (updatedOrders.length > 0) {
      this.emit('bulkOrdersUpdated', updatedOrders);
      this.emit('metricsUpdated', this.dataStore.getMetrics());
    }

    console.log(`📦 Bulk updated ${updatedOrders.length} orders`);
    return updatedOrders;
  }

  /**
   * Export orders to various formats
   */
  async exportOrders(format: 'json' | 'csv', filters?: any): Promise<string> {
    await this.simulateProgress('Preparing export...', 1000);

    const orders = this.dataStore.getOrders();
    
    if (format === 'json') {
      return JSON.stringify(orders, null, 2);
    }
    
    if (format === 'csv') {
      const headers = ['Order ID', 'Customer', 'Email', 'Amount', 'Status', 'Date'];
      const rows = orders.map(order => [
        order.orderId,
        order.customerName,
        order.customerEmail || '',
        order.orderAmount.toString(),
        order.status,
        order.orderDate
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    throw new Error('Unsupported export format');
  }

  /**
   * Simulate progress for better UX
   */
  private async simulateProgress(message: string, duration: number): Promise<void> {
    const steps = 10;
    const stepDuration = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      const progress = (i / steps) * 100;
      this.emit('progressUpdate', { message, progress });
      
      if (i < steps) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    }
  }

  /**
   * Get real-time statistics
   */
  getRealTimeStats() {
    const orders = this.dataStore.getOrders();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = orders.filter(order => 
      new Date(order.orderDate) >= today
    );
    
    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.orderAmount, 0),
      todayRevenue: todayOrders.reduce((sum, order) => sum + order.orderAmount, 0),
      statusCounts: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}
