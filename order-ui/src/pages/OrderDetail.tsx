import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge,
  Table 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faDownload, 
  faCalendar,
  faUser,
  faDollarSign,
  faFileInvoiceDollar,
  faIdCard
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useOrders, Order } from '../hooks/useOrders';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { formatCurrency, formatDate, getStatusVariant } from '../utils/helpers';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrder } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details
  const fetchOrder = async () => {
    if (!id) {
      setError('Order ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedOrder = await getOrder(id);
      setOrder(fetchedOrder);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch order details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Handle invoice download
  const handleDownloadInvoice = () => {
    if (!order?.invoiceFile) return;

    const link = document.createElement('a');
    link.href = order.invoiceFile;
    link.target = '_blank';
    link.download = `invoice-${order.orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Invoice download started');
  };

  if (loading) {
    return <Loading text="Loading order details..." fullScreen />;
  }

  if (error) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="text-center">
              <Card.Body className="py-5">
                <ErrorMessage 
                  message={error} 
                  onRetry={fetchOrder}
                />
                <Button 
                  variant="outline-primary" 
                  onClick={() => navigate('/')}
                  className="mt-3"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                  Back to Dashboard
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="text-center">
              <Card.Body className="py-5">
                <h4 className="text-muted">Order Not Found</h4>
                <p className="text-muted">The requested order could not be found.</p>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/')}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                  Back to Dashboard
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="fade-in">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Button
                variant="outline-primary"
                onClick={() => navigate('/')}
                className="me-3"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </Button>
              <div>
                <h1 className="mb-1">Order Details</h1>
                <p className="text-muted mb-0">Complete information about order #{order.orderId.split('-')[0]}...</p>
              </div>
            </div>
            <Badge bg={getStatusVariant(order.status)} className="fs-6 px-3 py-2">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 text-center slide-in-left">
            <Card.Body>
              <FontAwesomeIcon icon={faUser} size="2x" className="text-primary mb-2" />
              <h6 className="text-muted">Customer</h6>
              <h5 className="mb-0">{order.customerName}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 text-center slide-in-left" style={{ animationDelay: '0.1s' }}>
            <Card.Body>
              <FontAwesomeIcon icon={faDollarSign} size="2x" className="text-success mb-2" />
              <h6 className="text-muted">Amount</h6>
              <h5 className="mb-0">{formatCurrency(order.orderAmount)}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 text-center slide-in-left" style={{ animationDelay: '0.2s' }}>
            <Card.Body>
              <FontAwesomeIcon icon={faCalendar} size="2x" className="text-info mb-2" />
              <h6 className="text-muted">Date</h6>
              <h5 className="mb-0">{formatDate(order.orderDate).split(',')[0]}</h5>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 text-center slide-in-left" style={{ animationDelay: '0.3s' }}>
            <Card.Body>
              <FontAwesomeIcon icon={faFileInvoiceDollar} size="2x" className="text-warning mb-2" />
              <h6 className="text-muted">Invoice</h6>
              {order.invoiceFile ? (
                <Button variant="success" size="sm" onClick={handleDownloadInvoice}>
                  <FontAwesomeIcon icon={faDownload} className="me-1" />
                  Download
                </Button>
              ) : (
                <span className="text-muted">Not Available</span>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Information */}
      <Row>
        <Col lg={8}>
          <Card className="slide-in-right">
            <Card.Header>
              <h5 className="mb-0">Order Information</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive bordered>
                <tbody>
                  <tr>
                    <th style={{width: '200px'}} className="bg-light">
                      <FontAwesomeIcon icon={faIdCard} className="me-2" />
                      Order ID
                    </th>
                    <td>
                      <code className="text-primary">{order.orderId}</code>
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-light">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Customer Name
                    </th>
                    <td>{order.customerName}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Customer Email
                    </th>
                    <td>{order.customerEmail}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">
                      <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                      Order Amount
                    </th>
                    <td>
                      <strong className="text-success">{formatCurrency(order.orderAmount)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-light">
                      <FontAwesomeIcon icon={faCalendar} className="me-2" />
                      Order Date
                    </th>
                    <td>{formatDate(order.orderDate)}</td>
                  </tr>
                  <tr>
                    <th className="bg-light">
                      <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
                      Invoice File
                    </th>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="me-3">{order.invoiceFile ? 'Invoice file available' : 'No invoice file'}</span>
                        {order.invoiceFile && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleDownloadInvoice}
                          >
                            <FontAwesomeIcon icon={faDownload} className="me-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="slide-in-right" style={{ animationDelay: '0.2s' }}>
            <Card.Header>
              <h5 className="mb-0">Order Items</h5>
            </Card.Header>
            <Card.Body>
              {order.items && order.items.length > 0 ? (
                <div>
                  {order.items.map((item, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                      <div>
                        <strong>{item.name}</strong>
                        <br />
                        <small className="text-muted">Qty: {item.quantity}</small>
                      </div>
                      <Badge bg="success">{formatCurrency(item.price * item.quantity)}</Badge>
                    </div>
                  ))}
                  <hr />
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>Total:</strong>
                    <strong className="text-success">{formatCurrency(order.orderAmount)}</strong>
                  </div>
                </div>
              ) : (
                <p className="text-muted text-center py-3">No items specified</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
