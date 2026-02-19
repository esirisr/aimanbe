import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const MASTER_EMAIL = 'himilo@gmail.com';

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, location, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !location) {
      return res.status(400).json({
        message: "Name, email, password, phone, and location are required"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prevent public users from registering as admin
    let assignedRole = 'client';

    if (normalizedEmail === MASTER_EMAIL) {
      assignedRole = 'admin';
    } else if (role === 'pro') {
      assignedRole = 'pro';
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      location: location.toLowerCase().trim(),
      role: assignedRole
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("REGISTER_ERROR:", error.message);
    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({
        message: "Server configuration error"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("LOGIN_ERROR:", error.message);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
