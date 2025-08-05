import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Alert,
  Badge,
  Modal,
  Spinner,
  ProgressBar,
  InputGroup,
  Dropdown,
  ListGroup,
  Accordion
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus,
  faCloudUploadAlt,
  faTimes,
  faCheckCircle,
  faExclamationTriangle,
  faFileInvoiceDollar,
  faUser,
  faDollarSign,
  faShoppingCart,
  faCalendarAlt,
  faSave,
  faUndo,
  faMagic,
  faBarcode,
  faFileAlt,
  faBolt
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { OrderService, CreateOrderData } from '../services/orderService';
import useWebSocket from '../hooks/useWebSocket';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  description?: string;
  category?: string;
  sku?: string;
}

interface FormErrors {
  customerName?: string;
  customerEmail?: string;
  orderAmount?: string;
  invoiceFile?: string;
  items?: string;
}

interface AutoSaveData {
  customerName: string;
  customerEmail: string;
  orderAmount: string;
  items: OrderItem[];
  lastSaved: string;
}

export const AdvancedCreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout>();

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<OrderItem | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationMode, setValidationMode] = useState<'basic' | 'advanced'>('basic');

  // Smart suggestions
  const [customerSuggestions, setCustomerSuggestions] = useState<string[]>([]);
  const [itemSuggestions, setItemSuggestions] = useState<string[]>([]);

  const { sendTypingStart, sendTypingStop, isConnected } = useWebSocket(
    'create-order-user', 
    'Order Creator'
  );

  // Mock data for suggestions
  const mockCustomers = [
    'John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown', 'Charlie Davis',
    'Emma Johnson', 'Michael Chen', 'Sarah Garcia', 'David Martinez', 'Lisa Anderson'
  ];

  const mockItems = [
    'Laptop Computer', 'Wireless Mouse', 'Office Chair', 'Monitor Stand', 'Keyboard',
    'Desk Lamp', 'Webcam', 'Headphones', 'Tablet', 'Smartphone', 'Printer', 'Scanner'
  ];

  // Auto-save functionality
  const saveToLocalStorage = useCallback(() => {
    if (autoSaveEnabled && (customerName || customerEmail || orderAmount || items.length > 0)) {
      const autoSaveData: AutoSaveData = {
        customerName,
        customerEmail,
        orderAmount,
        items,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('order-form-autosave', JSON.stringify(autoSaveData));
      setLastSaved(new Date());
    }
  }, [customerName, customerEmail, orderAmount, items, autoSaveEnabled]);

  // Load auto-saved data
  useEffect(() => {
    const savedData = localStorage.getItem('order-form-autosave');
    if (savedData) {
      try {
        const parsedData: AutoSaveData = JSON.parse(savedData);
        setCustomerName(parsedData.customerName || '');
        setCustomerEmail(parsedData.customerEmail || '');
        setOrderAmount(parsedData.orderAmount || '');
        setItems(parsedData.items || []);
        setLastSaved(new Date(parsedData.lastSaved));
        toast.info('Restored auto-saved form data', { autoClose: 3000 });
      } catch (error) {
        console.error('Failed to load auto-saved data:', error);
      }
    }
  }, []);

  // Auto-save interval
  useEffect(() => {
    if (autoSaveEnabled) {
      autoSaveIntervalRef.current = setInterval(saveToLocalStorage, 30000); // Save every 30 seconds
      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [saveToLocalStorage, autoSaveEnabled]);

  // Smart suggestions
  const updateCustomerSuggestions = useCallback((input: string) => {
    if (input.length > 1) {
      const filtered = mockCustomers.filter(customer =>
        customer.toLowerCase().includes(input.toLowerCase())
      );
      setCustomerSuggestions(filtered.slice(0, 5));
    } else {
      setCustomerSuggestions([]);
    }
  }, []);

  const updateItemSuggestions = useCallback((input: string) => {
    if (input.length > 1) {
      const filtered = mockItems.filter(item =>
        item.toLowerCase().includes(input.toLowerCase())
      );
      setItemSuggestions(filtered.slice(0, 5));
    } else {
      setItemSuggestions([]);
    }
  }, []);

  // Advanced validation
  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    // Customer name validation
    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    } else if (customerName.trim().length < 2) {
      newErrors.customerName = 'Customer name must be at least 2 characters';
    } else if (validationMode === 'advanced' && !/^[a-zA-Z\s]+$/.test(customerName)) {
      newErrors.customerName = 'Customer name should only contain letters and spaces';
    }

    // Email validation
    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    // Order amount validation
    if (!orderAmount.trim()) {
      newErrors.orderAmount = 'Order amount is required';
    } else {
      const amount = parseFloat(orderAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.orderAmount = 'Order amount must be a positive number';
      } else if (validationMode === 'advanced' && amount > 100000) {
        newErrors.orderAmount = 'Order amount seems unusually high. Please verify.';
      }
    }

    // Items validation
    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    } else {
      const invalidItems = items.filter(item => 
        !item.name.trim() || item.quantity <= 0 || item.price <= 0
      );
      if (invalidItems.length > 0) {
        newErrors.items = 'All items must have valid name, quantity, and price';
      }
    }

    // File validation
    if (invoiceFile) {
      if (invoiceFile.size > 10 * 1024 * 1024) { // 10MB limit
        newErrors.invoiceFile = 'Invoice file must be smaller than 10MB';
      } else if (!['application/pdf', 'image/jpeg', 'image/png'].includes(invoiceFile.type)) {
        newErrors.invoiceFile = 'Invoice file must be PDF, JPEG, or PNG';
      }
    }

    return newErrors;
  }, [customerName, customerEmail, orderAmount, items, invoiceFile, validationMode]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + Math.random() * 20;
          return next > 90 ? 90 : next;
        });
      }, 200);

      const orderData: CreateOrderData = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        orderAmount: parseFloat(orderAmount),
        items
      };

      // Only add invoiceFile if it exists
      if (invoiceFile) {
        orderData.invoiceFile = invoiceFile;
      }

      const result = await OrderService.createOrder(orderData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Clear auto-saved data on successful submission
      localStorage.removeItem('order-form-autosave');

      toast.success('Order created successfully!', {
        position: 'top-right',
        autoClose: 5000
      });

      // Reset form
      resetForm();

      // Navigate to order details
      setTimeout(() => {
        navigate(`/orders/${result.orderId}`);
      }, 2000);

    } catch (error: any) {
      console.error('Error creating order:', error);
      setUploadProgress(0);
      toast.error(error.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setCustomerName('');
    setCustomerEmail('');
    setOrderAmount('');
    setInvoiceFile(null);
    setItems([]);
    setErrors({});
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setInvoiceFile(file);
      toast.success('File uploaded successfully!');
    } else {
      toast.error('Please upload a PDF, JPEG, or PNG file');
    }
  }, []);

  // Item management
  const addItem = () => {
    setCurrentItem({
      id: `item-${Date.now()}`,
      name: '',
      quantity: 1,
      price: 0,
      description: '',
      category: '',
      sku: ''
    });
    setShowItemModal(true);
  };

  const editItem = (item: OrderItem) => {
    setCurrentItem(item);
    setShowItemModal(true);
  };

  const saveItem = (item: OrderItem) => {
    if (items.find(i => i.id === item.id)) {
      setItems(items.map(i => i.id === item.id ? item : i));
    } else {
      setItems([...items, item]);
    }
    setShowItemModal(false);
    setCurrentItem(null);
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  // Auto-calculate total from items
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    if (total > 0 && orderAmount !== total.toString()) {
      setOrderAmount(total.toFixed(2));
    }
  }, [items, orderAmount]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <Container className="advanced-create-order">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="border-0 shadow-lg">
            <Card.Header className="bg-gradient-primary text-white">
              <Row className="align-items-center">
                <Col>
                  <h3 className="mb-0">
                    <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
                    Create New Order
                  </h3>
                  <small className="opacity-75">Fill in the details to create a new order</small>
                </Col>
                <Col xs="auto">
                  <Badge 
                    bg={isConnected ? 'success' : 'danger'} 
                    className="me-2"
                  >
                    {isConnected ? 'Connected' : 'Offline'}
                  </Badge>
                  {lastSaved && autoSaveEnabled && (
                    <Badge bg="info">
                      Auto-saved {lastSaved.toLocaleTimeString()}
                    </Badge>
                  )}
                </Col>
              </Row>
            </Card.Header>

            <Card.Body className="p-4">
              {/* Auto-save and validation controls */}
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Check
                    type="switch"
                    id="auto-save"
                    label="Auto-save form data"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  />
                </Col>
                <Col md={6} className="text-end">
                  <Form.Select
                    size="sm"
                    value={validationMode}
                    onChange={(e) => setValidationMode(e.target.value as 'basic' | 'advanced')}
                    style={{ width: 'auto', display: 'inline-block' }}
                  >
                    <option value="basic">Basic Validation</option>
                    <option value="advanced">Advanced Validation</option>
                  </Form.Select>
                </Col>
              </Row>

              <Form onSubmit={handleSubmit}>
                {/* Customer Information */}
                <Card className="mb-4 border-0 bg-light">
                  <Card.Body>
                    <h5 className="card-title mb-3">
                      <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                      Customer Information
                    </h5>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Customer Name *</Form.Label>
                          <InputGroup>
                            <Form.Control
                              type="text"
                              placeholder="Enter customer name"
                              value={customerName}
                              onChange={(e) => {
                                setCustomerName(e.target.value);
                                updateCustomerSuggestions(e.target.value);
                                if (isConnected) {
                                  sendTypingStart('customer-name');
                                }
                              }}
                              onBlur={() => {
                                if (isConnected) {
                                  sendTypingStop('customer-name');
                                }
                                setCustomerSuggestions([]);
                              }}
                              isInvalid={!!errors.customerName}
                              className="form-control-lg"
                            />
                            <InputGroup.Text>
                              <FontAwesomeIcon icon={faUser} />
                            </InputGroup.Text>
                            <Form.Control.Feedback type="invalid">
                              {errors.customerName}
                            </Form.Control.Feedback>
                          </InputGroup>
                          
                          {/* Customer suggestions */}
                          {customerSuggestions.length > 0 && (
                            <ListGroup className="position-absolute w-100" style={{ zIndex: 1000 }}>
                              {customerSuggestions.map((suggestion, index) => (
                                <ListGroup.Item
                                  key={index}
                                  action
                                  onClick={() => {
                                    setCustomerName(suggestion);
                                    setCustomerSuggestions([]);
                                  }}
                                >
                                  {suggestion}
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          )}
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Customer Email</Form.Label>
                          <InputGroup>
                            <Form.Control
                              type="email"
                              placeholder="customer@example.com"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              isInvalid={!!errors.customerEmail}
                              className="form-control-lg"
                            />
                            <InputGroup.Text>@</InputGroup.Text>
                            <Form.Control.Feedback type="invalid">
                              {errors.customerEmail}
                            </Form.Control.Feedback>
                          </InputGroup>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Order Items */}
                <Card className="mb-4 border-0 bg-light">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="card-title mb-0">
                        <FontAwesomeIcon icon={faShoppingCart} className="me-2 text-primary" />
                        Order Items
                      </h5>
                      <Button variant="outline-primary" onClick={addItem}>
                        <FontAwesomeIcon icon={faPlus} className="me-1" />
                        Add Item
                      </Button>
                    </div>

                    {errors.items && (
                      <Alert variant="danger" className="mb-3">
                        {errors.items}
                      </Alert>
                    )}

                    {items.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-primary">
                            <tr>
                              <th>Item Name</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Total</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, index) => (
                              <tr key={item.id}>
                                <td>
                                  <div>
                                    <strong>{item.name}</strong>
                                    {item.description && (
                                      <>
                                        <br />
                                        <small className="text-muted">{item.description}</small>
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td>{item.quantity}</td>
                                <td>${item.price.toFixed(2)}</td>
                                <td><strong>${(item.quantity * item.price).toFixed(2)}</strong></td>
                                <td>
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    className="me-1"
                                    onClick={() => editItem(item)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => removeItem(item.id)}
                                  >
                                    <FontAwesomeIcon icon={faTimes} />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="table-light">
                            <tr>
                              <th colSpan={3}>Subtotal</th>
                              <th>${subtotal.toFixed(2)}</th>
                              <th></th>
                            </tr>
                            <tr>
                              <th colSpan={3}>Tax (10%)</th>
                              <th>${tax.toFixed(2)}</th>
                              <th></th>
                            </tr>
                            <tr>
                              <th colSpan={3}>Total</th>
                              <th className="text-primary">${total.toFixed(2)}</th>
                              <th></th>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <Alert variant="info" className="text-center">
                        <FontAwesomeIcon icon={faShoppingCart} size="2x" className="mb-2" />
                        <p className="mb-0">No items added yet. Click "Add Item" to start.</p>
                      </Alert>
                    )}
                  </Card.Body>
                </Card>

                {/* Order Amount */}
                <Card className="mb-4 border-0 bg-light">
                  <Card.Body>
                    <h5 className="card-title mb-3">
                      <FontAwesomeIcon icon={faDollarSign} className="me-2 text-primary" />
                      Order Amount
                    </h5>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Total Amount *</Form.Label>
                          <InputGroup size="lg">
                            <InputGroup.Text>$</InputGroup.Text>
                            <Form.Control
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              value={orderAmount}
                              onChange={(e) => setOrderAmount(e.target.value)}
                              isInvalid={!!errors.orderAmount}
                              readOnly={items.length > 0}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.orderAmount}
                            </Form.Control.Feedback>
                          </InputGroup>
                          {items.length > 0 && (
                            <Form.Text className="text-muted">
                              Amount is automatically calculated from items
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Invoice Upload */}
                <Card className="mb-4 border-0 bg-light">
                  <Card.Body>
                    <h5 className="card-title mb-3">
                      <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2 text-primary" />
                      Invoice File (Optional)
                    </h5>
                    
                    <div
                      className={`upload-zone ${dragActive ? 'active' : ''} ${errors.invoiceFile ? 'error' : ''}`}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={() => setDragActive(true)}
                      onDragLeave={() => setDragActive(false)}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="text-center py-4">
                        <FontAwesomeIcon 
                          icon={faCloudUploadAlt} 
                          size="3x" 
                          className={`mb-3 ${dragActive ? 'text-primary' : 'text-muted'}`}
                        />
                        <h6>
                          {invoiceFile ? invoiceFile.name : 'Drop your invoice file here or click to browse'}
                        </h6>
                        <p className="text-muted">
                          Supports PDF, JPEG, PNG files up to 10MB
                        </p>
                        {invoiceFile && (
                          <Badge bg="success">
                            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                            File selected
                          </Badge>
                        )}
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setInvoiceFile(file);
                      }}
                      style={{ display: 'none' }}
                    />

                    {errors.invoiceFile && (
                      <Alert variant="danger" className="mt-2 mb-0">
                        {errors.invoiceFile}
                      </Alert>
                    )}
                  </Card.Body>
                </Card>

                {/* Upload Progress */}
                {loading && uploadProgress > 0 && (
                  <Card className="mb-4 border-0 bg-light">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span>Uploading...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <ProgressBar 
                        animated 
                        now={uploadProgress} 
                        variant={uploadProgress === 100 ? 'success' : 'primary'}
                      />
                    </Card.Body>
                  </Card>
                )}

                {/* Form Actions */}
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPreview(true)}
                      disabled={loading}
                      className="me-2"
                    >
                      <FontAwesomeIcon icon={faFileAlt} className="me-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline-warning"
                      onClick={resetForm}
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faUndo} className="me-1" />
                      Reset
                    </Button>
                  </div>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    className="px-4"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faBolt} className="me-2" />
                        Create Order
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Item Modal */}
      <Modal show={showItemModal} onHide={() => setShowItemModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentItem?.id?.includes('item-') ? 'Add Item' : 'Edit Item'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ItemForm
            item={currentItem}
            onSave={saveItem}
            onCancel={() => setShowItemModal(false)}
            suggestions={itemSuggestions}
            onNameChange={updateItemSuggestions}
          />
        </Modal.Body>
      </Modal>

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OrderPreview
            customerName={customerName}
            customerEmail={customerEmail}
            orderAmount={parseFloat(orderAmount) || 0}
            items={items}
            invoiceFile={invoiceFile}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Item Form Component
interface ItemFormProps {
  item: OrderItem | null;
  onSave: (item: OrderItem) => void;
  onCancel: () => void;
  suggestions: string[];
  onNameChange: (name: string) => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ item, onSave, onCancel, suggestions, onNameChange }) => {
  const [formData, setFormData] = useState<OrderItem>(
    item || {
      id: `item-${Date.now()}`,
      name: '',
      quantity: 1,
      price: 0,
      description: '',
      category: '',
      sku: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.quantity > 0 && formData.price > 0) {
      onSave(formData);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Label>Item Name *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter item name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                onNameChange(e.target.value);
              }}
              required
            />
            {suggestions.length > 0 && (
              <ListGroup className="mt-1">
                {suggestions.map((suggestion, index) => (
                  <ListGroup.Item
                    key={index}
                    action
                    onClick={() => {
                      setFormData({ ...formData, name: suggestion });
                      onNameChange(''); // Clear suggestions
                    }}
                  >
                    {suggestion}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>SKU</Form.Label>
            <Form.Control
              type="text"
              placeholder="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Quantity *</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              required
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Price *</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select category</option>
              <option value="electronics">Electronics</option>
              <option value="office">Office Supplies</option>
              <option value="furniture">Furniture</option>
              <option value="software">Software</option>
              <option value="other">Other</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          placeholder="Item description (optional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="secondary" onClick={onCancel} className="me-2">
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save Item
        </Button>
      </div>
    </Form>
  );
};

// Order Preview Component
interface OrderPreviewProps {
  customerName: string;
  customerEmail: string;
  orderAmount: number;
  items: OrderItem[];
  invoiceFile: File | null;
}

const OrderPreview: React.FC<OrderPreviewProps> = ({
  customerName,
  customerEmail,
  orderAmount,
  items,
  invoiceFile
}) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="order-preview">
      <div className="text-center mb-4">
        <h4>Order Preview</h4>
        <Badge bg="primary">Order #{Date.now()}</Badge>
      </div>

      <Card className="mb-3">
        <Card.Header>Customer Information</Card.Header>
        <Card.Body>
          <p><strong>Name:</strong> {customerName || 'Not specified'}</p>
          <p><strong>Email:</strong> {customerEmail || 'Not specified'}</p>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Header>Order Items ({items.length})</Card.Header>
        <Card.Body>
          {items.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">No items added</p>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Header>Order Summary</Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Tax (10%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <strong>Total:</strong>
            <strong>${total.toFixed(2)}</strong>
          </div>
        </Card.Body>
      </Card>

      {invoiceFile && (
        <Card>
          <Card.Header>Invoice File</Card.Header>
          <Card.Body>
            <p><strong>File:</strong> {invoiceFile.name}</p>
            <p><strong>Size:</strong> {(invoiceFile.size / 1024).toFixed(2)} KB</p>
            <p><strong>Type:</strong> {invoiceFile.type}</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default AdvancedCreateOrder;
