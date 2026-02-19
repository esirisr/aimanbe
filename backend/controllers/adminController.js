import User from '../models/User.js';

/**
 * @desc    GET Dashboard Data with Role & Location Filtering
 * @logic   Admin sees all stats. Clients only see verified/non-suspended pros in their city.
 */
export const getAdminDashboardData = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    // 1. Fetch the requester's data to identify their location
    const currentUser = await User.findById(userId);
    if (!currentUser) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Normalize user location: trim spaces and lowercase for perfect matching
    const userLocation = currentUser.location ? currentUser.location.trim().toLowerCase() : '';

    // 2. Fetch all professionals, excluding the master admin
    const allPros = await User.find({ 
      role: 'pro', 
      email: { $ne: 'himiloone@gmail.com' } 
    }).select('-password').sort({ createdAt: -1 });

    // --- ADMIN VIEW: Sees everything to manage them ---
    if (role === 'admin') {
      return res.json({
        success: true,
        stats: {
          totalPros: allPros.length,
          pendingApprovals: allPros.filter(p => !p.isVerified).length,
          livePros: allPros.filter(p => p.isVerified && !p.isSuspended).length,
          suspendedCount: allPros.filter(p => p.isSuspended).length
        },
        allPros
      });
    }

    // --- CLIENT VIEW: Matching Logic ---
    // Filters based on Verification, Suspension, and City Normalization
    const matchedPros = allPros.filter(p => {
      // Handle both Boolean and String types for database flexibility
      const isVerified = p.isVerified === true || String(p.isVerified) === 'true';
      const isSuspended = p.isSuspended === true || String(p.isSuspended) === 'true';
      
      // Normalize Pro Location for comparison
      const proLocation = p.location ? p.location.trim().toLowerCase() : '';
      
      // The core logic: City must match exactly after normalization
      return isVerified && !isSuspended && proLocation === userLocation;
    });

    res.json({ success: true, allPros: matchedPros });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    APPROVE Professional
 */
export const verifyPro = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isVerified = true;
    await user.save();

    res.json({ success: true, message: "Professional Approved!", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

/**
 * @desc    TOGGLE Suspension (Ban/Unban)
 */
export const toggleSuspension = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.isSuspended = !user.isSuspended;
    await user.save();
    
    res.json({ 
      success: true, 
      message: user.isSuspended ? "Professional Suspended" : "Professional Reinstated",
      isSuspended: user.isSuspended 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Suspension toggle failed" });
  }
};

/**
 * @desc    DELETE User
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Deletion failed" });
  }
};