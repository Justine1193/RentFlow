// Import core dependencies
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Import route handlers and error middleware
import authRoutes from './routes/auth.route.js';
import propertyRoutes from './routes/property.routes.js';
import unitRoutes from './routes/unit.route.js';
import { errorHandler } from './utils/errors.js';

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

// Health check route to verify that the server is online
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ ok: true });
});

// Mount route handlers under their respective URL prefixes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/units', unitRoutes);

// Global error handler middleware (must come after all routes)
app.use(errorHandler);

// Start listening for incoming network requests
app.listen(PORT, () => {
  console.log(`🚀 RentFlow Server running on http://localhost:${PORT}`);
});
