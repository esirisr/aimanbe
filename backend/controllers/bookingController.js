import Booking from '../models/Booking.js';
import User from '../models/User.js';

/**
 * @desc    Create a Hire Request
 * @logic   Auto-cancels same-skill pending requests & enforces 3-per-day limit.
 */
export const createBooking = async (req, res) => {
  try {
    const { proId } = req.body;
    const clientId = req.user.id;

    // 1. Find the pro to get their business category/skill
    const targetPro = await User.findById(proId);
    if (!targetPro) return res.status(404).json({ message: "Professional not found" });
    
    const proSkill = targetPro.businessCategory;

    // 2. Prevent multiple pending requests for the same skill
    const existingSkillRequest = await Booking.findOne({
      client: clientId,
      status: 'pending'
    }).populate('professional');

    if (existingSkillRequest && existingSkillRequest.professional.businessCategory === proSkill) {
      await Booking.findByIdAndDelete(existingSkillRequest._id);
    }

    // 3. Daily Limit Check (Max 3 per day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const dailyCount = await Booking.countDocuments({
      professional: proId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (dailyCount >= 3) {
      return res.status(400).json({ 
        message: `This ${proSkill} has reached their daily limit. Please choose another.` 
      });
    }

    // 4. Create the request
    const newBooking = new Booking({
      client: clientId,
      professional: proId
    });

    await newBooking.save();
    res.json({ success: true, message: `Hire request for ${proSkill} sent!` });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Get User/Pro Bookings
 * @logic   Populates data for UI cards including current ratings
 */
export const getMyBookings = async (req, res) => {
  try {
    const query = req.user.role === 'pro' 
      ? { professional: req.user.id } 
      : { client: req.user.id };

    const bookings = await Booking.find(query)
      .populate('client', 'name email')
      .populate('professional', 'name businessName businessCategory location phone rating reviewCount') 
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

/**
 * @desc    Update Booking Status (Approve/Reject)
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    await Booking.findByIdAndUpdate(bookingId, { status });
    res.json({ success: true, message: `Job ${status}` });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

/**
 * @desc    Submit a Star Rating
 * @logic   Updates the booking and recalculates the Professional's overall average
 */
export const submitRating = async (req, res) => {
  try {
    const { bookingId, ratingValue } = req.body;

    // 1. Update the specific booking with the star value
    const booking = await Booking.findByIdAndUpdate(
      bookingId, 
      { rating: ratingValue }, 
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking record not found" });
    }

    // 2. Get all rated bookings for this specific professional
    const allRatedBookings = await Booking.find({ 
      professional: booking.professional, 
      rating: { $ne: null } 
    });

    // 3. Calculate new average
    const totalStars = allRatedBookings.reduce((sum, item) => sum + item.rating, 0);
    const newAverage = (totalStars / allRatedBookings.length).toFixed(1);

    // 4. Sync the new average and count to the User profile
    await User.findByIdAndUpdate(booking.professional, {
      rating: parseFloat(newAverage),
      reviewCount: allRatedBookings.length
    });

    res.json({ 
      success: true, 
      message: "Rating submitted successfully", 
      newAverage 
    });
  } catch (error) {
    console.error("Rating Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};