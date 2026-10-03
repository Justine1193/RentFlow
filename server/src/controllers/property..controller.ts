import type { Request, Response } from "express";
import {
  propertySchema,
  updatePropertySchema,
  createUnitSchema,
  updateUnitSchema,
} from "../validators/property.validator.js";
import * as propertyService from "../services/property.service.js";

// requireAuth saved the logged-in user in res.locals.user
const ownerId = (res: Response) => res.locals.user.id as string;

// .parse() throws a ZodError if the data is invalid. errorHandler turns it into a 400.
// Controllers stay short: read the request, call the service, send the response.

export async function getProperties(_req: Request, res: Response) {
  const properties = await propertyService.listProperties(ownerId(res));
  res.json({ properties });
}

export async function postProperty(req: Request, res: Response) {
  const data = propertySchema.parse(req.body);
  const property = await propertyService.createProperty(ownerId(res), data);
  res.status(201).json({ property });
}

export async function patchProperty(req: Request, res: Response) {
  const data = updatePropertySchema.parse(req.body);
  const property = await propertyService.updateProperty(ownerId(res), req.params.id as string, data);
  res.json({ property });
}

export async function removeProperty(req: Request, res: Response) {
  await propertyService.deleteProperty(ownerId(res), req.params.id as string);
  res.status(204).send(); // 204 = success, nothing to return
}

export async function getUnits(req: Request, res: Response) {
  const units = await propertyService.listUnits(ownerId(res), req.params.id as string);
  res.json({ units });
}

export async function postUnit(req: Request, res: Response) {
  const data = createUnitSchema.parse(req.body);
  const unit = await propertyService.createUnit(ownerId(res), data);
  res.status(201).json({ unit });
}

export async function patchUnit(req: Request, res: Response) {
  const data = updateUnitSchema.parse(req.body);
  const unit = await propertyService.updateUnit(ownerId(res), req.params.id as string, data);
  res.json({ unit });
}