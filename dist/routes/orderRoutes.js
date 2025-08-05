"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const orderController_1 = require("../controllers/orderController");
const validation_1 = require("../middleware/validation");
// Configure multer for memory storage (optimal for cloud uploads)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
});
const router = (0, express_1.Router)();
const orderController = new orderController_1.OrderController();
// Routes
router.post('/orders', upload.single('invoiceFile'), validation_1.validateCreateOrder, orderController.createOrder);
router.get('/orders/:id', orderController.getOrderById);
router.get('/orders', orderController.getAllOrders);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map