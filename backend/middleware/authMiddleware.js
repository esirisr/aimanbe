import jwt from 'jsonwebtoken';

const MASTER_EMAIL = 'himilo@gmail.com';

export const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    // 1. Master Admin Override (Case-insensitive)
    if (req.user && req.user.email.toLowerCase() === MASTER_EMAIL.toLowerCase()) {
      return next();
    }

    // 2. Role Check
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: ${req.user?.role || 'User'} role unauthorized`
      });
    }
    next();
  };
};
