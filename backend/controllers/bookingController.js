import Booking from '../models/Booking.js';
import User from '../models/User.js';

export const createBooking = async (req, res) => {
  try {
    const { proId } = req.body;
    const clientId = req.user.id;
    const targetPro = await User.findById(proId);
    if (!targetPro) return res.status(404).json({ message: "Professional not found" });

    // Enforce 3-per-day limit logic
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const dailyCount = await Booking.countDocuments({
      professional: proId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (dailyCount >= 3) {
      return res.status(400).json({ message: "Daily limit reached for this pro." });
    }

    const newBooking = new Booking({ client: clientId, professional: proId });
    await newBooking.save();
    res.json({ success: true, message: `Request sent to ${targetPro.name}!` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const isPro = req.user.role === 'pro';
    const query = isPro ? { professional: req.user.id } : { client: req.user.id };
    const bookings = await Booking.find(query)
      .populate('client', 'name email phone location')
      .populate('professional', 'name businessName businessCategory location phone rating')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching bookings" });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true })
      .populate('client', 'name phone');

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    let responseMessage = `Status updated to ${status}`;
    if (status === 'accepted') {
      responseMessage = `Accepted! Please call ${booking.client?.name} at ${booking.client?.phone} now.`;
    }

    res.json({ success: true, message: responseMessage, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

export const submitRating = async (req, res) => {
  try {
    const { bookingId, ratingValue } = req.body;
    const booking = await Booking.findByIdAndUpdate(bookingId, { rating: ratingValue }, { new: true });
    const allRated = await Booking.find({ professional: booking.professional, rating: { $ne: null } });
    const newAverage = (allRated.reduce((sum, item) => sum + item.rating, 0) / allRated.length).toFixed(1);
    await User.findByIdAndUpdate(booking.professional, { rating: parseFloat(newAverage), reviewCount: allRated.length });
    res.json({ success: true, message: "Rating saved" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Rating failed" });
  }
};