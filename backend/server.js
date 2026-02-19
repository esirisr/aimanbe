import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json()); // Required to read req.body

// Route Mounting
// This creates: https://your-app.railway.app/api/auth/register
app.use('/api/auth', authRoutes);

app.use('/api/admin', adminRoutes);

// Root Health Check
app.get('/', (req, res) => res.send('🚀 API is live...'));

// 404 Handler - If you see this in the browser, your frontend URL is wrong
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found on this server.` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
