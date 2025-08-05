import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faDownload, faSpinner, faClipboardList, faPlus } from '@fortawesome/free-solid-svg-icons';
import { LinkContainer } from 'react-router-bootstrap';
import { Order } from '../hooks/useOrders';
import { formatCurrency, formatDate, getStatusVariant } from '../utils/helpers';

interface OrderTableProps {
  orders: Order[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({ 
  orders, 
  loading = false, 
  hasMore = false, 
  onLoadMore 
}) => {
  const handleDownload = (url: string, orderId: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `invoice-${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (orders.length === 0 && !loading) {
    return (
      <div className="text-center py-5">
        <FontAwesomeIcon icon={faClipboardList} size="3x" className="text-muted mb-3" />
        <h4 className="text-muted">No orders found</h4>
        <p className="text-muted">Create your first order to get started</p>
        <LinkContainer to="/create">
          <Button variant="primary">
            <FontAwesomeIcon icon={faPlus} className="me-1" />
            Create Order
          </Button>
        </LinkContainer>
      </div>
    );
  }

  return (
    <>
      <div className="table-responsive">
        <Table striped bordered hover className="fade-in">
          <thead className="table-dark">
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Invoice</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.orderId} className="slide-in-left" style={{ animationDelay: `${index * 0.1}s` }}>
                <td>
                  <code className="text-primary">{order.orderId.split('-')[0]}...</code>
                </td>
                <td>
                  <div>
                    <strong>{order.customerName}</strong>
                    <br />
                    <small className="text-muted">{order.customerEmail}</small>
                  </div>
                </td>
                <td>
                  <Badge bg="success" className="fs-6">
                    {formatCurrency(order.orderAmount)}
                  </Badge>
                </td>
                <td>
                  <Badge bg={getStatusVariant(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </td>
                <td>
                  <small className="text-muted">
                    {formatDate(order.orderDate)}
                  </small>
                </td>
                <td>
                  {order.invoiceFile && (
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleDownload(order.invoiceFile || '', order.orderId)}
                      title="Download Invoice"
                    >
                      <FontAwesomeIcon icon={faDownload} className="me-1" />
                      PDF
                    </Button>
                  )}
                </td>
                <td>
                  <LinkContainer to={`/orders/${order.orderId}`}>
                    <Button variant="primary" size="sm">
                      <FontAwesomeIcon icon={faEye} className="me-1" />
                      View
                    </Button>
                  </LinkContainer>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-3">
          <Button
            variant="outline-primary"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                Loading...
              </>
            ) : (
              'Load More Orders'
            )}
          </Button>
        </div>
      )}
    </>
  );
};
