// Import Zod schema validation library
import { z } from "zod";

// Schema for creating a new property
export const createPropertySchema = z.object({
  name: z.string().trim().min(1, "Property name is required."),
  address: z.string().trim().min(1, "Address is required."),
});

// Schema for updating an existing property
export const updatePropertySchema = z.object({
  name: z.string().trim().min(1, "Property name cannot be empty.").optional(),
  address: z.string().trim().min(1, "Address cannot be empty.").optional(),
});
