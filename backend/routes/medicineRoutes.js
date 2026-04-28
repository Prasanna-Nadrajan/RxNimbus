import express from 'express';
import { getMedicines, createMedicine, updateMedicine, deleteMedicine, getAlerts } from '../controllers/medicineController.js';
import { protect, pharmacistOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/alerts', protect, pharmacistOrAdmin, getAlerts);
router.route('/')
  .get(protect, getMedicines)
  .post(protect, pharmacistOrAdmin, createMedicine);
  
router.route('/:id')
  .put(protect, pharmacistOrAdmin, updateMedicine)
  .delete(protect, pharmacistOrAdmin, deleteMedicine);

export default router;
