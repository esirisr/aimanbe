import User from '../models/User.js';

// GET Dashboard Data with Role-Based Filtering
export const getAdminDashboardData = async (req, res) => {
  try {
    const role = req.user.role; 

    // Fetch all professionals, excluding the master admin
    const allPros = await User.find({ 
      role: 'pro', 
      email: { $ne: 'himiloone@gmail.com' } 
    }).select('-password').sort({ createdAt: -1 });

    // ADMIN VIEW: Sees everything to manage them
    if (role === 'admin') {
      return res.json({
        success: true,
        stats: {
          totalPros: allPros.length,
          pendingApprovals: allPros.filter(p => p.isVerified !== true && p.isVerified !== 'true').length,
          livePros: allPros.filter(p => (p.isVerified === true || p.isVerified === 'true') && !p.isSuspended).length,
          suspendedCount: allPros.filter(p => p.isSuspended === true || p.isSuspended === 'true').length
        },
        allPros
      });
    }

    // CLIENT VIEW: Only sees pros that are VERIFIED and NOT SUSPENDED
    const publicPros = allPros.filter(p => {
      const isVerified = p.isVerified === true || p.isVerified === 'true';
      const isSuspended = p.isSuspended === true || p.isSuspended === 'true';
      return isVerified && !isSuspended;
    });

    res.json({ success: true, allPros: publicPros });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// APPROVE Professional
export const verifyPro = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isVerified = true;
    await user.save();

    res.json({ success: true, message: "Professional Approved!", user });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// TOGGLE Suspension
export const toggleSuspension = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isSuspended = !user.isSuspended;
    await user.save();
    res.json({ success: true, isSuspended: user.isSuspended });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// DELETE User
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};