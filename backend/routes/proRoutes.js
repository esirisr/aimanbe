import express from 'express';
import { getAllPros, getProProfile } from '../controllers/proController.js';
import { protect } from '../middleware/authMiddleware.js'; // Ensure this path is correct

const router = express.Router();

// Public route to see all pros
router.get('/all', getAllPros);

// Protected route for the dashboard
// URL: http://localhost:5000/api/pros/profile
router.get('/profile', protect, getProProfile);

export default router;