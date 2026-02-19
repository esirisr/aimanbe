import express from 'express';
const router = express.Router();
import { getAdminDashboardData, verifyPro, toggleSuspension, deleteUser } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.use(protect);
router.get('/dashboard', getAdminDashboardData);
router.patch('/verify/:id', authorize('admin'), verifyPro);
router.patch('/toggle-suspension/:id', authorize('admin'), toggleSuspension);
router.delete('/user/:id', authorize('admin'), deleteUser);

export default router;