import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'pro', 'admin'], default: 'client' },
  location: { 
    type: String, 
    required: true,
    lowercase: true, 
    trim: true 
  },
  phone: { type: String },
  isVerified: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  skills: { type: [String], default: [] },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;