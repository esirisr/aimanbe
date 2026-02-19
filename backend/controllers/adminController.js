import User from '../models/User.js';

/**
 * @desc    GET Dashboard Data with Role & Location Filtering
 * @logic   Admin sees all stats. Clients only see verified/non-suspended pros in their city.
 */
export const getAdminDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch the requester's data
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // --- MASTER ADMIN OVERRIDE ---
    // If this is your email, force the role to 'admin' regardless of DB settings
    const MASTER_EMAIL = 'himilo@gmail.com';
    let userRole = currentUser.role;
    
    if (currentUser.email === MASTER_EMAIL) {
      userRole = 'admin';
    }

    // Normalize user location for filtering
    const userLocation = currentUser.location ? currentUser.location.trim().toLowerCase() : '';

    // 2. Fetch all professionals (Exclude the master admin from being listed as a Pro)
    const allPros = await User.find({ 
      role: 'pro', 
      email: { $ne: MASTER_EMAIL } 
    }).select('-password').sort({ createdAt: -1 });

    // --- ADMIN VIEW ---
    if (userRole === 'admin') {
      return res.json({
        success: true,
        isAdmin: true, // Helper flag for frontend
        stats: {
          totalPros: allPros.length,
          pendingApprovals: allPros.filter(p => !p.isVerified).length,
          livePros: allPros.filter(p => p.isVerified && !p.isSuspended).length,
          suspendedCount: allPros.filter(p => p.isSuspended).length
        },
        allPros
      });
    }

    // --- CLIENT VIEW ---
    const matchedPros = allPros.filter(p => {
      const isVerified = p.isVerified === true || String(p.isVerified) === 'true';
      const isSuspended = p.isSuspended === true || String(p.isSuspended) === 'true';
      const proLocation = p.location ? p.location.trim().toLowerCase() : '';
      
      // Clients only see verified, active pros in their specific city
      return isVerified && !isSuspended && proLocation === userLocation;
    });

    res.json({ 
      success: true, 
      isAdmin: false,
      allPros: matchedPros 
    });

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
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { isVerified: true }, 
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

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