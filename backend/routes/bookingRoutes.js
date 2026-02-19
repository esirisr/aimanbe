import express from 'express';
const router = express.Router();
import { 
  createBooking, 
  updateBookingStatus, 
  getMyBookings,
  submitRating 
} from '../controllers/bookingController.js'; 
import { protect } from '../middleware/authMiddleware.js';

// This becomes: POST http://localhost:5000/api/bookings/create
router.post('/create', protect, createBooking);

// This becomes: PATCH http://localhost:5000/api/bookings/update-status
// IMPORTANT: Use .patch to match the ProDashboard axios call
router.patch('/update-status', protect, updateBookingStatus);

// This becomes: GET http://localhost:5000/api/bookings/my-bookings
router.get('/my-bookings', protect, getMyBookings);

router.post('/rate', protect, submitRating);

export default router;