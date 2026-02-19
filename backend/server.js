import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js'; 
import userRoutes from './routes/userRoutes.js'; 
import proRoutes from './routes/proRoutes.js'; // 1. ADD THIS IMPORT

dotenv.config();
const app = express();

app.use(cors()); 
app.use(express.json());

connectDB();

// Mounting Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/pros', proRoutes); // 2. ADD THIS MOUNTING LINE

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));