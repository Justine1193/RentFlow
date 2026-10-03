// Import Express Router, controller handlers, and authentication middleware
import { Router } from "express";
import {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
} from "../controllers/property.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

// Create the properties router
export const propertyRoutes = Router();

// Protect all property endpoints: require authenticated user
propertyRoutes.use(requireAuth);

// Restrict to LANDLORD and ADMIN roles
propertyRoutes.use(requireRole("LANDLORD", "ADMIN"));

// Route mappings
propertyRoutes.get("/", getProperties);
propertyRoutes.get("/:id", getProperty);
propertyRoutes.post("/", createProperty);
propertyRoutes.put("/:id", updateProperty);
propertyRoutes.delete("/:id", deleteProperty);

export default propertyRoutes;
export { unitRoutes } from "./unit.route.js";
