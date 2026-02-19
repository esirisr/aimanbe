import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true,
    minlength: [3, 'Name must be at least 3 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    // Note: The logic in authController handles the master admin 'himilo@gmail.com'
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: { 
    type: String, 
    enum: ['client', 'pro', 'admin'], 
    default: 'client' 
  },
  location: { 
    type: String, 
    required: [true, 'Location is required'],
    lowercase: true, 
    trim: true,
    default: 'hargeisa' // Matching your registration fallback
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'], 
    trim: true,
    match: [/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/, 'Please fill a valid phone number']
  },
  // Professionals need verification, Admins are verified by default
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  isSuspended: { 
    type: Boolean, 
    default: false 
  },
  skills: { 
    type: [String], 
    default: [] 
  },
  rating: { 
    type: Number, 
    default: 0 
  },
  reviewCount: { 
    type: Number, 
    default: 0 
  },
  dailyRequestCount: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

// Optional: Indexing email for faster lookups since we use it heavily in middleware
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);
export default User;