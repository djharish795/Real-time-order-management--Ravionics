import { Router } from 'express';
import multer from 'multer';
import { OrderController } from '../controllers/orderController';
import { validateCreateOrder } from '../middleware/validation';

// Configure multer for memory storage (optimal for cloud uploads)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

const router = Router();
const orderController = new OrderController();

// Routes
router.post('/orders', upload.single('invoiceFile'), validateCreateOrder, orderController.createOrder);
router.get('/orders/:id', orderController.getOrderById);
router.get('/orders', orderController.getAllOrders);

export default router;
