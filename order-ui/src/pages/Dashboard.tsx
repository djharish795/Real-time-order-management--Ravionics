import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faRefresh, 
  faChartLine, 
  faShoppingCart,
  faUsers,
  faDollarSign,
  faArrowUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import { useOrders } from '../hooks/useOrders';
import { OrderTable } from '../components/OrderTable';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import ProfessionalLayout from '../components/ProfessionalLayout';
import { formatCurrency } from '../utils/helpers';
import '../styles/Professional.css';
import '../styles/ProfessionalLayout.css';

export const Dashboard: React.FC = () => {
  const { orders, loading, error, hasMore, fetchOrders, loadMoreOrders } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate statistics with trends
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.orderAmount, 0);
  const uniqueCustomers = new Set(orders.map(order => order.customerName)).size;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Mock trend data (in real app, this would come from API)
  const trends = {
    orders: { value: 12.5, isPositive: true },
    revenue: { value: 8.3, isPositive: true },
    customers: { value: 5.2, isPositive: false },
    avgOrder: { value: 3.1, isPositive: true }
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const metrics = [
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      icon: faShoppingCart,
      trend: trends.orders,
      color: 'primary'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: faDollarSign,
      trend: trends.revenue,
      color: 'success'
    },
    {
      title: 'Unique Customers',
      value: uniqueCustomers.toLocaleString(),
      icon: faUsers,
      trend: trends.customers,
      color: 'info'
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(avgOrderValue),
      icon: faChartLine,
      trend: trends.avgOrder,
      color: 'warning'
    }
  ];

  return (
    <ProfessionalLayout 
      activeModule="dashboard" 
      pageTitle="Dashboard"
      showCreateButton={true}
      onCreateClick={() => window.location.href = '/orders/create'}
    >
      {/* Professional Metrics Grid */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="metric-header">
              <div className="metric-title">{metric.title}</div>
              <div className={`metric-icon metric-icon-${metric.color}`}>
                <FontAwesomeIcon icon={metric.icon} />
              </div>
            </div>
            <div className="metric-value">{metric.value}</div>
            <div className={`metric-change ${metric.trend.isPositive ? 'positive' : 'negative'}`}>
              <FontAwesomeIcon icon={metric.trend.isPositive ? faArrowUp : faArrowDown} />
              {metric.trend.value}% vs last month
            </div>
          </div>
        ))}
      </div>

      {/* Professional Filter Bar */}
      <div className="filter-bar">
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Search Orders</label>
            <div className="search-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="Search by customer name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control-professional"
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select className="filter-select">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Date Range</label>
            <select className="filter-select">
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Actions</label>
            <button 
              className="btn-professional btn-secondary"
              onClick={fetchOrders} 
              disabled={loading}
            >
              <FontAwesomeIcon icon={faRefresh} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Professional Data Grid */}
      <div className="data-grid animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="data-grid-header">
          <h3 className="data-grid-title">
            Recent Orders
            {filteredOrders.length !== orders.length && (
              <span className="text-muted ms-2" style={{ fontSize: '14px', fontWeight: 400 }}>
                ({filteredOrders.length} of {orders.length} orders)
              </span>
            )}
          </h3>
          <div className="data-grid-actions">
            <button className="btn-professional btn-outline">
              <FontAwesomeIcon icon={faChartLine} />
              Analytics
            </button>
          </div>
        </div>
        
        <div className="data-grid-body">
          {error && (
            <div className="p-4">
              <ErrorMessage message={error} onRetry={fetchOrders} />
            </div>
          )}
          
          {loading && orders.length === 0 ? (
            <div className="loading-container" style={{ padding: '4rem', textAlign: 'center' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '1rem', color: 'var(--gray-600)' }}>Loading orders...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table-professional">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr key={order.orderId} className="animate-slide-in-right" style={{ animationDelay: `${index * 0.05}s` }}>
                      <td>
                        <div className="order-id">
                          <strong>{order.orderId.substring(0, 8)}...</strong>
                        </div>
                      </td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-name">{order.customerName}</div>
                          {order.customerEmail && (
                            <div className="customer-email">{order.customerEmail}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="order-date">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="order-amount">
                          <strong>{formatCurrency(order.orderAmount)}</strong>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-professional btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '12px' }}>
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {hasMore && !searchTerm && (
                <div className="pagination-professional">
                  <div className="pagination-info">
                    Showing {orders.length} orders
                  </div>
                  <div className="pagination-controls">
                    <button 
                      className="btn-professional btn-secondary"
                      onClick={loadMoreOrders}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProfessionalLayout>
  );
};
