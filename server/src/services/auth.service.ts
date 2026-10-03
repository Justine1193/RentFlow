// Import password hashing tool and database client
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

// Register a new landlord user in the database
export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  // Step 1: Check if a user with this email already exists
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return null; // Return null to signal duplicate email
  }

  // Step 2: Hash the plaintext password with 10 salt rounds
  const passwordHash = await bcrypt.hash(data.password, 10);

  // Step 3: Insert the new user into the database
  // Default role is LANDLORD for public signups
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: "LANDLORD",
    },
    // Only return safe fields (never return passwordHash)
    select: { id: true, name: true, email: true, phone: true, role: true },
  });

  return user;
}

// Authenticate an existing user with email and password
export async function loginUser(email: string, password: string) {
  // Step 1: Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return null; // User not found
  }

  // Step 2: Compare plaintext password against hashed password in database
  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return null; // Invalid password
  }

  // Step 3: Return user profile data without passwordHash
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
}

// Fetch user profile by ID for active sessions
export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true, role: true },
  });
}