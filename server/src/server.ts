// Import core dependencies
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Import route handlers
import authRoutes from './routes/auth.route.js';

// Load environment variables from .env file
dotenv.config();

// Create the Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React frontend (port 5173) can communicate with this API
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Parse incoming JSON request bodies (req.body)
app.use(express.json());

// Parse incoming cookies from request headers (req.cookies)
app.use(cookieParser());

// Mount the authentication routes under the /api/auth prefix
app.use('/api/auth', authRoutes);

// Health check route to verify that the server is online
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ ok: true });
});

// Start listening for incoming network requests
app.listen(PORT, () => {
  console.log(`🚀 RentFlow Server running on http://localhost:${PORT}`);
});
