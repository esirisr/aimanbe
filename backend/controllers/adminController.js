import User from '../models/User.js';

export const getAdminDashboardData = async (req, res) => {
  try {
    // Fetches all users with the 'pro' role for management
    const pros = await User.find({ role: 'pro' }).select('-password');
    res.status(200).json({ success: true, allPros: pros });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard", error: error.message });
  }
};

export const verifyPro = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findByIdAndUpdate(id, { isVerified: true }, { new: true });
    res.status(200).json({ success: true, message: "Professional verified", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleSuspension = async (req, res) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id);
    user.isSuspended = !user.isSuspended;
    await user.save();
    res.status(200).json({ success: true, message: "Status updated", isSuspended: user.isSuspended });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User permanently removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
