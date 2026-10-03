import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/errors.js";

// Every function takes ownerId so a landlord can only touch their OWN data.

// Finds a property only if it belongs to this landlord, otherwise 404.
// (We say "not found" instead of "forbidden" so nobody can guess other IDs.)
async function getOwnedProperty(ownerId: string, propertyId: string) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, ownerId },
    include: { _count: { select: { units: true } } },
  });
  if (!property) throw new HttpError(404, "Property not found.");
  return property;
}

export function listProperties(ownerId: string) {
  return prisma.property.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { units: true } } }, // adds a unit count to each property
  });
}

export function getPropertyById(ownerId: string, propertyId: string) {
  return getOwnedProperty(ownerId, propertyId);
}

export function createProperty(ownerId: string, data: { name: string; address: string }) {
  return prisma.property.create({
    data: { ...data, ownerId },
    include: { _count: { select: { units: true } } },
  });
}

export async function updateProperty(
  ownerId: string,
  propertyId: string,
  data: { name?: string; address?: string }
) {
  await getOwnedProperty(ownerId, propertyId); // ownership check
  return prisma.property.update({
    where: { id: propertyId },
    data,
    include: { _count: { select: { units: true } } },
  });
}

export async function deleteProperty(ownerId: string, propertyId: string) {
  await getOwnedProperty(ownerId, propertyId); // ownership check
  return prisma.property.delete({
    where: { id: propertyId },
  });
}
