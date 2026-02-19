import express from 'express';
const router = express.Router();
import { 
  createBooking, 
  updateBookingStatus, 
  getMyBookings,
  submitRating // 1. Added the new controller import
} from '../controllers/bookingController.js'; 
import { protect } from '../middleware/authMiddleware.js';

// Existing routes
router.post('/create', protect, createBooking);
router.patch('/update-status', protect, updateBookingStatus);
router.get('/my-bookings', protect, getMyBookings);

// 2. Added the Rating route
// This must be a POST request as it sends data to the server
router.post('/rate', protect, submitRating);

export default router;