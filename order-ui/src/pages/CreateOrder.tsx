import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert,
  ProgressBar 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faArrowLeft, 
  faUpload, 
  faCheck,
  faSpinner,
  faUser,
  faEnvelope,
  faDollarSign,
  faFileUpload
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { OrderService, CreateOrderData } from '../services/orderService';
import { validateFile, FileValidationResult } from '../utils/helpers';
import ProfessionalLayout from '../components/ProfessionalLayout';
import '../styles/Professional.css';
import '../styles/ProfessionalLayout.css';

interface FormData {
  customerName: string;
  customerEmail: string;
  orderAmount: string;
  invoiceFile: File | null;
}

interface FormErrors {
  customerName?: string;
  customerEmail?: string;
  orderAmount?: string;
  invoiceFile?: string;
}

export const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerEmail: '',
    orderAmount: '',
    invoiceFile: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Customer name validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = 'Customer name must be at least 2 characters';
    } else if (formData.customerName.trim().length > 100) {
      newErrors.customerName = 'Customer name cannot exceed 100 characters';
    }

    // Customer email validation
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customerEmail.trim())) {
        newErrors.customerEmail = 'Please enter a valid email address';
      }
    }

    // Order amount validation
    if (!formData.orderAmount) {
      newErrors.orderAmount = 'Order amount is required';
    } else {
      const amount = parseFloat(formData.orderAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.orderAmount = 'Order amount must be a positive number';
      } else if (amount > 999999.99) {
        newErrors.orderAmount = 'Order amount cannot exceed $999,999.99';
      }
    }

    // File validation (optional)
    if (formData.invoiceFile) {
      const fileValidation = validateFile(formData.invoiceFile);
      if (!fileValidation.isValid) {
        newErrors.invoiceFile = fileValidation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, invoiceFile: file }));
    
    if (file) {
      const fileValidation = validateFile(file);
      if (!fileValidation.isValid) {
        setErrors(prev => ({ ...prev, invoiceFile: fileValidation.error }));
      } else {
        setErrors(prev => ({ ...prev, invoiceFile: undefined }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const orderData: CreateOrderData = {
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        orderAmount: parseFloat(formData.orderAmount),
        items: [] // Default empty items array for basic order creation
      };

      // Only add invoiceFile if it exists
      if (formData.invoiceFile) {
        orderData.invoiceFile = formData.invoiceFile;
      }

      const createdOrder = await OrderService.createOrder(orderData);
      
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      toast.success(`Order ${createdOrder.orderId.split('-')[0]}... created successfully!`);
      
      // Navigate to order detail page
      setTimeout(() => {
        navigate(`/orders/${createdOrder.orderId}`);
      }, 1000);

    } catch (error: any) {
      console.error('Create order error:', error);
      toast.error(error.message || 'Failed to create order');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfessionalLayout 
      activeModule="orders" 
      pageTitle="Create New Order"
      showCreateButton={false}
    >
      <div className="professional-container">
        {/* Professional Form Card */}
        <div className="professional-card animate-fade-in-up">
          <div className="card-header">
            <h2 className="card-title">
              <FontAwesomeIcon icon={faFileUpload} />
              Order Information
            </h2>
            <p className="card-subtitle">
              Fill in the details below to create a new order
            </p>
          </div>
          
          <div className="card-body">
            <Form onSubmit={handleSubmit}>
              <Row>
                {/* Customer Name */}
                <Col md={6}>
                  <div className="form-group-professional">
                    <label className="form-label-professional">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter customer name"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      className={`form-control-professional ${errors.customerName ? 'is-invalid' : ''}`}
                      disabled={loading}
                    />
                    {errors.customerName && (
                      <div className="invalid-feedback d-block text-danger mt-1">
                        {errors.customerName}
                      </div>
                    )}
                  </div>
                </Col>

                {/* Customer Email */}
                <Col md={6}>
                  <div className="form-group-professional">
                    <label className="form-label-professional">
                      <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                      Customer Email *
                    </label>
                    <input
                      type="email"
                      placeholder="Enter customer email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      className={`form-control-professional ${errors.customerEmail ? 'is-invalid' : ''}`}
                      disabled={loading}
                    />
                    {errors.customerEmail && (
                      <div className="invalid-feedback d-block text-danger mt-1">
                        {errors.customerEmail}
                      </div>
                    )}
                  </div>
                </Col>
              </Row>

              <Row>
                {/* Order Amount */}
                <Col md={6}>
                  <div className="form-group-professional">
                    <label className="form-label-professional">
                      <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                      Order Amount ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="999999.99"
                      placeholder="0.00"
                      value={formData.orderAmount}
                      onChange={(e) => handleInputChange('orderAmount', e.target.value)}
                      className={`form-control-professional ${errors.orderAmount ? 'is-invalid' : ''}`}
                      disabled={loading}
                    />
                    {errors.orderAmount && (
                      <div className="invalid-feedback d-block text-danger mt-1">
                        {errors.orderAmount}
                      </div>
                    )}
                  </div>
                </Col>

                {/* Invoice File */}
                <Col md={6}>
                  <div className="form-group-professional">
                    <label className="form-label-professional">
                      <FontAwesomeIcon icon={faUpload} className="me-2" />
                      Invoice File (PDF)
                    </label>
                    <div className="file-upload-container">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className={`form-control-professional ${errors.invoiceFile ? 'is-invalid' : ''}`}
                        disabled={loading}
                        id="invoice-file"
                      />
                      <label htmlFor="invoice-file" className="file-upload-label">
                        <FontAwesomeIcon icon={faUpload} className="me-2" />
                        {formData.invoiceFile ? formData.invoiceFile.name : 'Choose PDF file'}
                      </label>
                    </div>
                    {errors.invoiceFile && (
                      <div className="invalid-feedback d-block text-danger mt-1">
                        {errors.invoiceFile}
                      </div>
                    )}
                    <small className="form-text text-muted">
                      Optional. Only PDF files are allowed. Maximum size: 5MB.
                    </small>
                  </div>
                </Col>
              </Row>

              {/* Upload Progress */}
              {loading && uploadProgress > 0 && (
                <div className="form-group-professional">
                  <label className="form-label-professional">Upload Progress</label>
                  <div className="progress-container">
                    <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                      <div 
                        className="progress-bar bg-primary" 
                        style={{ width: `${uploadProgress}%` }}
                        role="progressbar"
                      />
                    </div>
                    <small className="text-muted mt-1">{uploadProgress}% completed</small>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="form-actions" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--gray-200)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <button
                    type="button"
                    className="btn-professional btn-secondary"
                    onClick={() => navigate('/')}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                    Back to Dashboard
                  </button>
                  
                  <button
                    type="submit"
                    className="btn-professional btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        Create Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </ProfessionalLayout>
  );
};

// Make sure to export default as well
export default CreateOrder;
