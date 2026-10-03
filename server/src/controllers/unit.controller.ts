import type { Request, Response } from "express";
import { createUnitSchema, updateUnitSchema } from "../validators/unit.validator.js";
import * as unitService from "../services/unit.service.js";
import { HttpError } from "../utils/errors.js";

// Helper for consistent error response handling
function handleError(res: Response, error: unknown) {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error("Unit Controller Error:", error);
  return res.status(500).json({ message: "Internal server error." });
}

// GET /api/units - list all units for the current landlord (optional ?propertyId=...)
export async function getUnits(req: Request, res: Response) {
  try {
    const ownerId = res.locals.user.id;
    const propertyId = req.query.propertyId as string | undefined;
    const units = await unitService.listUnits(ownerId, propertyId);
    return res.status(200).json({ units });
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/units/:id - get a single unit
export async function getUnit(req: Request, res: Response) {
  try {
    const ownerId = res.locals.user.id;
    const unitId = req.params.id as string;
    const unit = await unitService.getUnitById(ownerId, unitId);
    return res.status(200).json({ unit });
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/units - create a new unit
export async function createUnit(req: Request, res: Response) {
  try {
    const result = createUnitSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }

    const ownerId = res.locals.user.id;
    const unit = await unitService.createUnit(ownerId, result.data);
    return res.status(201).json({ unit });
  } catch (error) {
    return handleError(res, error);
  }
}

// PUT /api/units/:id - update a unit
export async function updateUnit(req: Request, res: Response) {
  try {
    const result = updateUnitSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }

    const ownerId = res.locals.user.id;
    const unitId = req.params.id as string;
    const unit = await unitService.updateUnit(ownerId, unitId, result.data);
    return res.status(200).json({ unit });
  } catch (error) {
    return handleError(res, error);
  }
}

// DELETE /api/units/:id - delete a unit
export async function deleteUnit(req: Request, res: Response) {
  try {
    const ownerId = res.locals.user.id;
    const unitId = req.params.id as string;
    await unitService.deleteUnit(ownerId, unitId);
    return res.status(200).json({ message: "Unit deleted successfully." });
  } catch (error) {
    return handleError(res, error);
  }
}
