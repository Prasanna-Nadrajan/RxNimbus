import express from 'express';
import { createOrder, getOrders } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getOrders) // Cashiers can view orders too
  .post(protect, createOrder);

export default router;
