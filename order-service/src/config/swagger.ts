import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Management API',
      version: '1.0.0',
      description: 'Real-time Order Management System with AWS Integration',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-domain.com/api'
          : 'http://localhost:8080/api',
      },
    ],
    components: {
      schemas: {
        Order: {
          type: 'object',
          required: ['orderId', 'customerName', 'orderAmount', 'orderDate', 'invoiceFileUrl'],
          properties: {
            orderId: { type: 'string', format: 'uuid' },
            customerName: { type: 'string', minLength: 2, maxLength: 100 },
            orderAmount: { type: 'number', minimum: 0.01, maximum: 999999.99 },
            orderDate: { type: 'string', format: 'date-time' },
            invoiceFileUrl: { type: 'string', format: 'uri' },
          },
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
