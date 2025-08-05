import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const createOrderSchema = Joi.object({
  customerName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Customer name is required',
      'string.min': 'Customer name must be at least 2 characters',
      'string.max': 'Customer name cannot exceed 100 characters',
    }),
  orderAmount: Joi.number()
    .positive()
    .precision(2)
    .max(999999.99)
    .required()
    .messages({
      'number.positive': 'Order amount must be positive',
      'number.max': 'Order amount cannot exceed 999,999.99',
    }),
});

export const validateCreateOrder = (req: Request, res: Response, next: NextFunction) => {
  const { error } = createOrderSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: error.details[0].message,
    });
  }
  
  // Validate file
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Invoice file is required',
    });
  }

  if (req.file.mimetype !== 'application/pdf') {
    return res.status(400).json({
      success: false,
      message: 'Only PDF files are allowed',
    });
  }

  if (req.file.size > 5 * 1024 * 1024) { // 5MB limit
    return res.status(400).json({
      success: false,
      message: 'File size cannot exceed 5MB',
    });
  }

  next();
};
