import express from 'express';
const router = express.Router();
import { 
  getAdminDashboardData, 
  verifyPro, 
  toggleSuspension, 
  deleteUser 
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// All routes here require login and admin role (or master email)
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboardData);
router.post('/verify', verifyPro);
router.post('/toggle-suspension', toggleSuspension);
router.post('/delete', deleteUser);

export default router;
