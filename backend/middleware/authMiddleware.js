import jwt from 'jsonwebtoken';

// Master Admin Configuration
const MASTER_EMAIL = 'himilo@gmail.com';

export const protect = (req, res, next) => {
  // 1. Grab token from Header
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // 2. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Attach user data to request object
    // Note: We include email in the token during login now (from previous step)
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    // --- MASTER ADMIN OVERRIDE ---
    // If the user's email is the master admin, allow access regardless of the roles list
    if (req.user && req.user.email === MASTER_EMAIL) {
      return next();
    }

    // Standard Role Check
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Role ${req.user?.role || 'unknown'} is not authorized to access this route` 
      });
    }

    next();
  };
};