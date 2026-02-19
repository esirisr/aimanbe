import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['client', 'pro', 'admin'], 
    default: 'client' 
  },
  location: { 
    type: String, 
    default: 'Not Specified' 
  },
  phone: { 
    type: String 
  },
  // Used for professional branding on cards
  businessName: { 
    type: String 
  },
  // Matches the dropdown category logic in your booking controller
  businessCategory: { 
    type: String 
  },
  // Array to store specific tags like ['electrician']
  skills: { 
    type: [String], 
    default: [] 
  },
  // Logic driver: Professionals start as 'Under Review'
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  // Updated: Initialized at 0 so "New" can be displayed if no reviews exist
  rating: { 
    type: Number, 
    default: 0 
  },
  // NEW: Tracks the total number of customer ratings
  reviewCount: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;