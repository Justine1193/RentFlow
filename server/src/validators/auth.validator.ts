// Import Zod schema validation library
import { z } from "zod";

// Validation rules for user registration requests
export const registerSchema = z.object({
  // Name must be at least 2 characters long
  name: z.string().trim().min(2, "Enter your full name."),
  // Email must be a valid email format
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  // Password must be at least 8 characters long for security
  password: z.string().min(8, "Password must be at least 8 characters."),
  // Phone number is optional
  phone: z.string().trim().optional(),
});

// Validation rules for user login requests
export const loginSchema = z.object({
  // Email must be a valid email
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  // Password is required
  password: z.string().min(1, "Enter your password."),
});
