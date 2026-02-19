import express from 'express';
const router = express.Router();
import { getMyProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/profile', protect, getMyProfile);

export default router;