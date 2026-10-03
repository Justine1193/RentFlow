import type { Request, Response } from "express";
import { registerSchema } from "../validators/auth.validator.js";
import { registerUser } from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: result.error.issues[0].message });
  }

  const user = await registerUser(result.data);
  if (!user) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  return res.status(201).json({ user });
}
