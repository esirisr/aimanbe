import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Master Admin Configuration
const MASTER_EMAIL = 'himilo@gmail.com';

// --- REGISTER CONTROLLER ---
export const register = async (req, res) => {
  try {
    const { name, email, password, role, location, phone, skills } = req.body;

    // 1. Strict Email Check & Normalization
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- ROLE LOGIC ---
    // If the email is the master email, force 'admin' role regardless of what frontend sent
    let assignedRole = role;
    if (normalizedEmail === MASTER_EMAIL) {
      assignedRole = 'admin';
    }

    // 3. Create User Document
    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: assignedRole, // Uses the logic from above
      phone,
      location: location ? location.toLowerCase().trim() : 'hargeisa',
      skills: assignedRole === 'pro' ? (Array.isArray(skills) ? skills : [skills]) : []
    });

    await newUser.save();
    
    res.status(201).json({ 
      success: true, 
      message: `Registration successful! ${assignedRole === 'admin' ? 'Admin account created.' : ''}` 
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// --- LOGIN CONTROLLER ---
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      return res.status(400).json({ message: "No account found with this email." });
    }

    // 2. Comprehensive check for password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    // 3. Check if account is suspended
    if (user.isSuspended) {
      return res.status(403).json({ message: "Your account has been suspended. Please contact support." });
    }

    // --- ADMIN OVERRIDE ---
    // Double-check: If this is the master email, ensure we use 'admin' in the token
    const effectiveRole = normalizedEmail === MASTER_EMAIL ? 'admin' : user.role;

    // 4. Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: effectiveRole }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // 5. Send Response
    res.json({ 
      token, 
      role: effectiveRole, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        location: user.location,
        isVerified: user.isVerified 
      } 
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed due to a server error." });
  }
};