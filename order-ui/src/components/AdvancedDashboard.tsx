import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Alert,
  Button,
  ProgressBar,
  Modal,
  ListGroup,
  Form,
  InputGroup,
  Dropdown
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine,
  faDollarSign,
  faShoppingCart,
  faUsers,
  faBell,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faExclamationTriangle,
  faRefresh,
  faFilter,
  faDownload,
  faExpand,
  faCompress
} from '@fortawesome/free-solid-svg-icons';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { formatCurrency, formatDate } from '../utils/helpers';
import useWebSocket from '../hooks/useWebSocket';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
  subtitle?: string;
}

interface OrderMetrics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  todaysOrders: number;
  todaysRevenue: number;
  conversionRate: number;
  customerSatisfaction: number;
}

interface TimeSeriesData {
  date: string;
  orders: number;
  revenue: number;
}

export const AdvancedDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<OrderMetrics>({
    totalOrders: 1247,
    totalRevenue: 189450.75,
    averageOrderValue: 152.08,
    pendingOrders: 23,
    processingOrders: 15,
    completedOrders: 1198,
    cancelledOrders: 11,
    todaysOrders: 34,
    todaysRevenue: 5234.50,
    conversionRate: 68.5,
    customerSatisfaction: 94.2
  });

  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  const { 
    notifications, 
    orderUpdates, 
    systemStats, 
    isConnected,
    clearNotifications 
  } = useWebSocket('dashboard-user', 'Dashboard');

  // Generate mock time series data
  const generateTimeSeriesData = useCallback(() => {
    const data: TimeSeriesData[] = [];
    const days = selectedDateRange === '7d' ? 7 : selectedDateRange === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        orders: Math.floor(Math.random() * 50) + 20,
        revenue: Math.floor(Math.random() * 5000) + 2000
      });
    }
    
    setTimeSeriesData(data);
  }, [selectedDateRange]);

  useEffect(() => {
    generateTimeSeriesData();
  }, [generateTimeSeriesData]);

  // Auto refresh data
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        generateTimeSeriesData();
        // Simulate metrics updates
        setMetrics(prev => ({
          ...prev,
          todaysOrders: prev.todaysOrders + Math.floor(Math.random() * 3),
          todaysRevenue: prev.todaysRevenue + (Math.random() * 500)
        }));
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, generateTimeSeriesData]);

  // Listen for metrics updates from WebSocket
  useEffect(() => {
    const handleMetricsUpdate = (event: CustomEvent) => {
      const newMetrics = event.detail;
      setMetrics(prev => ({ ...prev, ...newMetrics }));
    };

    window.addEventListener('metricsUpdate', handleMetricsUpdate as EventListener);
    return () => window.removeEventListener('metricsUpdate', handleMetricsUpdate as EventListener);
  }, []);

  const metricCards: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      change: 12.5,
      icon: faDollarSign,
      color: 'success',
      subtitle: `${formatCurrency(metrics.todaysRevenue)} today`
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders.toLocaleString(),
      change: 8.3,
      icon: faShoppingCart,
      color: 'primary',
      subtitle: `${metrics.todaysOrders} today`
    },
    {
      title: 'Average Order Value',
      value: formatCurrency(metrics.averageOrderValue),
      change: -2.1,
      icon: faChartLine,
      color: 'info',
      subtitle: 'Last 30 days'
    },
    {
      title: 'Customer Satisfaction',
      value: `${metrics.customerSatisfaction}%`,
      change: 5.7,
      icon: faUsers,
      color: 'warning',
      subtitle: 'Based on reviews'
    }
  ];

  // Chart configurations
  const revenueChartData = {
    labels: timeSeriesData.map(d => formatDate(d.date)),
    datasets: [
      {
        label: 'Revenue',
        data: timeSeriesData.map(d => d.revenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const ordersChartData = {
    labels: timeSeriesData.map(d => formatDate(d.date)),
    datasets: [
      {
        label: 'Orders',
        data: timeSeriesData.map(d => d.orders),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const statusChartData = {
    labels: ['Completed', 'Processing', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [
          metrics.completedOrders,
          metrics.processingOrders,
          metrics.pendingOrders,
          metrics.cancelledOrders
        ],
        backgroundColor: [
          'rgba(40, 167, 69, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(23, 162, 184, 0.8)',
          'rgba(220, 53, 69, 0.8)'
        ],
        borderColor: [
          'rgba(40, 167, 69, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(23, 162, 184, 1)',
          'rgba(220, 53, 69, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      }
    }
  };

  const exportData = () => {
    const dataToExport = {
      metrics,
      timeSeriesData,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Container fluid className={`dashboard-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header with controls */}
      <Row className="mb-4">
        <Col md={8}>
          <h2 className="dashboard-title">
            <FontAwesomeIcon icon={faChartLine} className="me-2" />
            Advanced Analytics Dashboard
          </h2>
          <p className="text-muted">
            Real-time insights and metrics for your order management system
          </p>
        </Col>
        <Col md={4} className="text-end">
          <div className="dashboard-controls">
            <Badge 
              bg={isConnected ? 'success' : 'danger'} 
              className="me-2"
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              onClick={() => setShowNotifications(true)}
            >
              <FontAwesomeIcon icon={faBell} />
              {notifications.length > 0 && (
                <Badge bg="danger" className="ms-1">{notifications.length}</Badge>
              )}
            </Button>

            <Dropdown className="d-inline me-2">
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                <FontAwesomeIcon icon={faFilter} /> {selectedDateRange}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSelectedDateRange('7d')}>Last 7 days</Dropdown.Item>
                <Dropdown.Item onClick={() => setSelectedDateRange('30d')}>Last 30 days</Dropdown.Item>
                <Dropdown.Item onClick={() => setSelectedDateRange('90d')}>Last 90 days</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Button
              variant="outline-success"
              size="sm"
              className="me-2"
              onClick={exportData}
            >
              <FontAwesomeIcon icon={faDownload} />
            </Button>

            <Button
              variant="outline-info"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
            </Button>
          </div>
        </Col>
      </Row>

      {/* Real-time status */}
      {systemStats && (
        <Alert variant="info" className="mb-4">
          <Row>
            <Col md={3}>
              <strong>Connected Users:</strong> {systemStats.connectedUsers}
            </Col>
            <Col md={3}>
              <strong>Server Uptime:</strong> {Math.floor(systemStats.serverUptime / 3600)}h
            </Col>
            <Col md={3}>
              <strong>Auto Refresh:</strong> 
              <Form.Check
                type="switch"
                id="auto-refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="d-inline ms-2"
              />
            </Col>
            <Col md={3}>
              <strong>Last Update:</strong> {formatDate(new Date().toISOString())}
            </Col>
          </Row>
        </Alert>
      )}

      {/* Metric Cards */}
      <Row className="mb-4">
        {metricCards.map((card, index) => (
          <Col lg={3} md={6} key={index} className="mb-3">
            <Card className="metric-card h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="metric-icon">
                      <FontAwesomeIcon 
                        icon={card.icon} 
                        className={`text-${card.color}`}
                        size="2x"
                      />
                    </div>
                    <h3 className="metric-value mb-1">{card.value}</h3>
                    <p className="metric-title text-muted mb-1">{card.title}</p>
                    {card.subtitle && (
                      <small className="text-muted">{card.subtitle}</small>
                    )}
                  </div>
                  <div className="text-end">
                    <Badge 
                      bg={card.change > 0 ? 'success' : 'danger'}
                      className="change-badge"
                    >
                      {card.change > 0 ? '+' : ''}{card.change}%
                    </Badge>
                  </div>
                </div>
                <ProgressBar 
                  variant={card.color}
                  now={Math.abs(card.change) * 10}
                  style={{ height: '4px' }}
                  className="mt-3"
                />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="chart-card border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faChartLine} className="me-2" />
                Revenue Trend
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Line data={revenueChartData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="chart-card border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                Order Status
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Doughnut data={statusChartData} options={{ ...chartOptions, maintainAspectRatio: true }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Orders Chart and Recent Activity */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="chart-card border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                Daily Orders
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Bar data={ordersChartData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-transparent border-0">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faBell} className="me-2" />
                Recent Activity
              </h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {orderUpdates.slice(0, 10).map((update, index) => (
                <div key={index} className="activity-item mb-3 pb-2 border-bottom">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong className="d-block">
                        Order {update.orderId.split('-')[0]}...
                      </strong>
                      <small className="text-muted">
                        {update.customerName} • {formatCurrency(update.amount)}
                      </small>
                    </div>
                    <Badge 
                      bg={
                        update.type === 'created' ? 'success' :
                        update.type === 'updated' ? 'info' :
                        update.type === 'deleted' ? 'danger' : 'warning'
                      }
                    >
                      {update.type}
                    </Badge>
                  </div>
                  <small className="text-muted">
                    {formatDate(update.timestamp)}
                  </small>
                </div>
              ))}
              
              {orderUpdates.length === 0 && (
                <div className="text-center text-muted py-4">
                  <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="mb-2" />
                  <p>No recent activity</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notifications Modal */}
      <Modal 
        show={showNotifications} 
        onHide={() => setShowNotifications(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faBell} className="me-2" />
            Notifications ({notifications.length})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {notifications.length > 0 ? (
            <ListGroup variant="flush">
              {notifications.map((notification) => (
                <ListGroup.Item key={notification.id} className="border-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong className="d-block">{notification.title}</strong>
                      <p className="mb-1">{notification.message}</p>
                      <small className="text-muted">
                        {formatDate(notification.timestamp)}
                      </small>
                    </div>
                    <Badge bg={
                      notification.type === 'success' ? 'success' :
                      notification.type === 'warning' ? 'warning' :
                      notification.type === 'error' ? 'danger' : 'info'
                    }>
                      {notification.type}
                    </Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-center text-muted py-4">
              <FontAwesomeIcon icon={faCheckCircle} size="3x" className="mb-3" />
              <h5>All caught up!</h5>
              <p>No new notifications</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={clearNotifications}>
            Clear All
          </Button>
          <Button variant="primary" onClick={() => setShowNotifications(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdvancedDashboard;
