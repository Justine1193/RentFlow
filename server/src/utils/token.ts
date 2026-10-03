// Import JWT library and Express Response type
import jwt from "jsonwebtoken";
import type { Response } from "express";

// Cookie expiration duration: 7 days in milliseconds
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

// Cookie security configuration
const cookieOptions = {
  httpOnly: true, // Prevents client-side JavaScript from reading the cookie (protects against XSS)
  sameSite: "lax" as const, // Protects against Cross-Site Request Forgery (CSRF)
  secure: process.env.NODE_ENV === "production", // Only transmit cookie over HTTPS in production
};

// Generates a signed JWT token containing user ID and role
export function createToken(user: { id: string; role: string }) {
  return jwt.sign(
    { sub: user.id, role: user.role }, // Payload
    process.env.JWT_SECRET!, // Secret key from .env
    { expiresIn: "7d" } // Token validity
  );
}

// Attaches the JWT token to the HTTP response as a secure cookie
export function setAuthCookie(res: Response, token: string) {
  res.cookie("token", token, { ...cookieOptions, maxAge: SEVEN_DAYS });
}

// Clears the auth cookie upon logout
export function clearAuthCookie(res: Response) {
  res.clearCookie("token", cookieOptions);
}
