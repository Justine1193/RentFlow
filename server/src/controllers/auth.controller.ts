// Import Express types, validation schemas, business services, and token utilities
import type { Request, Response } from "express";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { registerUser, loginUser, getUserById } from "../services/auth.service.js";
import { createToken, setAuthCookie, clearAuthCookie } from "../utils/token.js";

// Controller for POST /api/auth/register
export async function register(req: Request, res: Response) {
  // Step 1: Validate request body against schema
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    // If invalid, return 400 Bad Request with the validation error message
    return res.status(400).json({ message: result.error.issues[0].message });
  }

  // Step 2: Call service to create user in database
  const user = await registerUser(result.data);
  if (!user) {
    // If email is already taken, return 409 Conflict
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  // Step 3: Generate JWT token and attach secure HTTP-only cookie
  const token = createToken(user);
  setAuthCookie(res, token);

  // Step 4: Return 201 Created with user info
  return res.status(201).json({ user });
}

// Controller for POST /api/auth/login
export async function login(req: Request, res: Response) {
  // Step 1: Validate login input (email & password)
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: result.error.issues[0].message });
  }

  // Step 2: Verify user credentials in database
  const user = await loginUser(result.data.email, result.data.password);
  if (!user) {
    // Return 401 Unauthorized for incorrect credentials
    return res.status(401).json({ message: "Invalid email or password." });
  }

  // Step 3: Create JWT and set cookie
  const token = createToken(user);
  setAuthCookie(res, token);

  // Step 4: Return 200 OK with user profile
  return res.status(200).json({ user });
}

// Controller for POST /api/auth/logout
export async function logout(req: Request, res: Response) {
  // Clear the auth cookie from the browser
  clearAuthCookie(res);
  return res.status(200).json({ message: "Logged out successfully." });
}

// Controller for GET /api/auth/me (requires authentication)
export async function getCurrentUser(req: Request, res: Response) {
  // res.locals.user is attached by the requireAuth middleware
  const userId = res.locals.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  const user = await getUserById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.status(200).json({ user });
}
