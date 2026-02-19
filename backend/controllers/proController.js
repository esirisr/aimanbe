import User from '../models/User.js';

// Get all professionals
export const getAllPros = async (req, res) => {
  try {
    const pros = await User.find({ role: 'pro' }).select('-password');
    res.status(200).json(pros);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// NEW: Get the profile of the logged-in pro
export const getProProfile = async (req, res) => {
  try {
    // req.user.id comes from your auth middleware
    const pro = await User.findById(req.user.id).select('-password');
    if (!pro) return res.status(404).json({ message: "Professional not found" });
    res.json(pro);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};