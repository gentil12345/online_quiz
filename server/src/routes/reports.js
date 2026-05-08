import express from 'express';
import {
  generateReport,
  getReports,
  getReportById,
  downloadReport,
  deleteReport,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', protect, authorize('teacher', 'admin'), generateReport);
router.get('/', protect, authorize('teacher', 'admin'), getReports);
router.get('/:id', protect, getReportById);
router.get('/:id/download', protect, downloadReport);
router.delete('/:id', protect, deleteReport);

export default router;
