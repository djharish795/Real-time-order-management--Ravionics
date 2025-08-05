import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faRedo } from '@fortawesome/free-solid-svg-icons';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  variant?: 'danger' | 'warning';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  variant = 'danger' 
}) => {
  return (
    <div className={variant === 'danger' ? 'error-message' : 'success-message'}>
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <span>{message}</span>
        </div>
        {onRetry && (
          <Button variant="outline-light" size="sm" onClick={onRetry}>
            <FontAwesomeIcon icon={faRedo} className="me-1" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
};
