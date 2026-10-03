// Import Express types, validation schemas, business service, and error utility
import type { Request, Response } from "express";
import { createPropertySchema, updatePropertySchema } from "../validators/property.validator.js";
import * as propertyService from "../services/property.service.js";
import { HttpError } from "../utils/errors.js";

// Helper for consistent error response handling
function handleError(res: Response, error: unknown) {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error("Property Controller Error:", error);
  return res.status(500).json({ message: "Internal server error." });
}

// GET /api/properties - list all properties owned by the current landlord
export async function getProperties(req: Request, res: Response) {
  try {
    const ownerId = res.locals.user.id;
    const properties = await propertyService.listProperties(ownerId);
    return res.status(200).json({ properties });
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/properties/:id - get a single property owned by the current landlord
export async function getProperty(req: Request, res: Response) {
  try {
    const ownerId = res.locals.user.id;
    const propertyId = req.params.id as string;
    const property = await propertyService.getPropertyById(ownerId, propertyId);
    return res.status(200).json({ property });
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/properties - create a new property for the current landlord
export async function createProperty(req: Request, res: Response) {
  try {
    const result = createPropertySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }

    const ownerId = res.locals.user.id;
    const property = await propertyService.createProperty(ownerId, result.data);
    return res.status(201).json({ property });
  } catch (error) {
    return handleError(res, error);
  }
}

// PUT /api/properties/:id - update property details
export async function updateProperty(req: Request, res: Response) {
  try {
    const result = updatePropertySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }

    const ownerId = res.locals.user.id;
    const propertyId = req.params.id as string;
    const property = await propertyService.updateProperty(ownerId, propertyId, result.data);
    return res.status(200).json({ property });
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/properties/:id - delete a property
export async function deleteProperty(req: Request, res: Response) {
  try {
    const ownerId = res.locals.user.id;
    const propertyId = req.params.id as string;
    await propertyService.deleteProperty(ownerId, propertyId);
    return res.status(200).json({ message: "Property deleted successfully." });
  } catch (error) {
    return handleError(res, error);
  }
}
