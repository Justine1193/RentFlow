import { z } from "zod";

// Schema for creating a new unit
export const createUnitSchema = z.object({
  propertyId: z.string().trim().min(1, "Property ID is required."),
  unitNumber: z.string().trim().min(1, "Unit number is required."),
  rentAmount: z.coerce.number().positive("Rent amount must be a positive number."),
  status: z.enum(["VACANT", "OCCUPIED", "MAINTENANCE"]).optional().default("VACANT"),
});

// Schema for updating an existing unit
export const updateUnitSchema = z.object({
  unitNumber: z.string().trim().min(1, "Unit number cannot be empty.").optional(),
  rentAmount: z.coerce.number().positive("Rent amount must be a positive number.").optional(),
  status: z.enum(["VACANT", "OCCUPIED", "MAINTENANCE"]).optional(),
});
