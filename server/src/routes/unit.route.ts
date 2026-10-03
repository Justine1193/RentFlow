// Import Express Router, controller handlers, and authentication middleware
import { Router } from "express";
import {
  getUnits,
  getUnit,
  createUnit,
  updateUnit,
  deleteUnit,
} from "../controllers/unit.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

// Create the units router
export const unitRoutes = Router();

// Protect all unit endpoints: require authenticated user
unitRoutes.use(requireAuth);

// Restrict to LANDLORD and ADMIN roles
unitRoutes.use(requireRole("LANDLORD", "ADMIN"));

// Route mappings
unitRoutes.get("/", getUnits);
unitRoutes.get("/:id", getUnit);
unitRoutes.post("/", createUnit);
unitRoutes.put("/:id", updateUnit);
unitRoutes.delete("/:id", deleteUnit);

export default unitRoutes;
