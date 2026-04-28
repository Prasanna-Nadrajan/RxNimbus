import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only admin can view full dashboard stats
router.get('/stats', protect, admin, getDashboardStats);

export default router;
