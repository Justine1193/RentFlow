// Import Express middleware types and JWT verification tool
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Middleware to ensure the incoming request has a valid JWT session
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Step 1: Read the JWT token from HTTP cookies
  const token = req.cookies?.token;
  if (!token) {
    // 401 Unauthorized if no token is present
    return res.status(401).json({ message: "Please log in to continue." });
  }

  try {
    // Step 2: Verify the token signature against our secret key
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string; // User ID
      role: string; // User Role (e.g. LANDLORD or TENANT)
    };

    // Step 3: Attach user info to res.locals so subsequent controllers can use it
    res.locals.user = { id: payload.sub, role: payload.role };

    // Step 4: Proceed to the next middleware or controller
    next();
  } catch {
    // 401 Unauthorized if token is expired, invalid, or tampered with
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}

// Middleware factory to restrict access to specific user roles
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if the authenticated user has one of the allowed roles
    if (!res.locals.user || !roles.includes(res.locals.user.role)) {
      // 403 Forbidden if user does not have permission
      return res.status(403).json({ message: "You don't have permission to do this." });
    }
    next();
  };
}
