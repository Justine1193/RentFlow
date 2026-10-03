import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/errors.js";

// Helper: Ensure the unit belongs to a property owned by the current landlord
async function getOwnedUnit(ownerId: string, unitId: string) {
  const unit = await prisma.unit.findFirst({
    where: {
      id: unitId,
      property: { ownerId },
    },
    include: {
      property: {
        select: { id: true, name: true, address: true },
      },
    },
  });

  if (!unit) {
    throw new HttpError(404, "Unit not found.");
  }

  return unit;
}

// List all units owned by the landlord (optionally filtered by propertyId)
export async function listUnits(ownerId: string, propertyId?: string) {
  return prisma.unit.findMany({
    where: {
      property: { ownerId },
      ...(propertyId ? { propertyId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      property: {
        select: { id: true, name: true, address: true },
      },
    },
  });
}

// Get single unit by ID
export async function getUnitById(ownerId: string, unitId: string) {
  return getOwnedUnit(ownerId, unitId);
}

// Create a new unit under a property owned by the landlord
export async function createUnit(
  ownerId: string,
  data: {
    propertyId: string;
    unitNumber: string;
    rentAmount: number;
    status?: "VACANT" | "OCCUPIED" | "MAINTENANCE";
  }
) {
  // Ensure the target property exists and is owned by the landlord
  const property = await prisma.property.findFirst({
    where: { id: data.propertyId, ownerId },
  });

  if (!property) {
    throw new HttpError(404, "Property not found.");
  }

  return prisma.unit.create({
    data: {
      propertyId: data.propertyId,
      unitNumber: data.unitNumber,
      rentAmount: data.rentAmount,
      status: data.status || "VACANT",
    },
    include: {
      property: {
        select: { id: true, name: true, address: true },
      },
    },
  });
}

// Update an existing unit
export async function updateUnit(
  ownerId: string,
  unitId: string,
  data: {
    unitNumber?: string;
    rentAmount?: number;
    status?: "VACANT" | "OCCUPIED" | "MAINTENANCE";
  }
) {
  await getOwnedUnit(ownerId, unitId);

  return prisma.unit.update({
    where: { id: unitId },
    data,
    include: {
      property: {
        select: { id: true, name: true, address: true },
      },
    },
  });
}

// Delete an existing unit
export async function deleteUnit(ownerId: string, unitId: string) {
  await getOwnedUnit(ownerId, unitId);

  return prisma.unit.delete({
    where: { id: unitId },
  });
}
