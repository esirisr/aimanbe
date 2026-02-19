import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';

// Import DB and Routes
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import proRoutes from './routes/proRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js'; // 1. IMPORTED NEW ROUTES

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// Initialize Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pros', proRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes); // 2. REGISTERED NEW ROUTES

// Simple Health Check Route
app.get('/', (req, res) => res.send('API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));