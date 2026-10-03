// Import Express router, controller functions, and authentication middleware
import { Router } from "express";
import { register, login, logout, getCurrentUser } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

// Create the auth router
export const authRoutes = Router();

// Public route: Register a new landlord account
authRoutes.post("/register", register);

// Public route: Log in with email and password
authRoutes.post("/login", login);

// Public route: Log out and clear session cookie
authRoutes.post("/logout", logout);

// Protected route: Fetch current logged-in user profile
authRoutes.get("/me", requireAuth, getCurrentUser);

export default authRoutes;
