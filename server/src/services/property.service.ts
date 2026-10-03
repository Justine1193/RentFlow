import { prisma } from "../lib/prisma.js";
import { HttpError } from "../utils/errors.js";

// Every function takes ownerId so a landlord can only touch their OWN data.

// Finds a property only if it belongs to this landlord, otherwise 404.
// (We say "not found" instead of "forbidden" so nobody can guess other IDs.)
async function getOwnedProperty(ownerId: string, propertyId: string) {
    const property = await prisma.property.findFirst({ where: { id: propertyId, ownerId } });
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
    return prisma.property.create({ data: { ...data, ownerId } });
}

export async function updateProperty(
    ownerId: string,
    propertyId: string,
    data: { name?: string; address?: string }
) {
    await getOwnedProperty(ownerId, propertyId); // ownership check
    return prisma.property.update({ where: { id: propertyId }, data });
}

export async function deleteProperty(ownerId: string, propertyId: string) {
    await getOwnedProperty(ownerId, propertyId);
    // Its units are deleted too (Cascade). When we add leases we'll block this
    // if the property still has active leases.
    await prisma.property.delete({ where: { id: propertyId } });
}

export async function listUnits(ownerId: string, propertyId: string) {
    await getOwnedProperty(ownerId, propertyId);
    return prisma.unit.findMany({ where: { propertyId }, orderBy: { unitNumber: "asc" } });
}

export async function createUnit(
    ownerId: string,
    data: { propertyId: string; unitNumber: string; rentAmount: number }
) {
    await getOwnedProperty(ownerId, data.propertyId);

    // Friendly error instead of a raw database error for duplicates
    const duplicate = await prisma.unit.findFirst({
        where: { propertyId: data.propertyId, unitNumber: data.unitNumber },
    });
    if (duplicate) throw new HttpError(409, "This property already has a unit with that number.");

    return prisma.unit.create({ data });
}

export async function updateUnit(
    ownerId: string,
    unitId: string,
    data: { unitNumber?: string; rentAmount?: number; status?: "VACANT" | "OCCUPIED" | "MAINTENANCE" }
) {
    // The unit belongs to a property, and the property belongs to the landlord
    const unit = await prisma.unit.findFirst({
        where: { id: unitId, property: { ownerId } },
    });
    if (!unit) throw new HttpError(404, "Unit not found.");

    // If the unit number changes, make sure it isn't taken in the same property
    if (data.unitNumber && data.unitNumber !== unit.unitNumber) {
        const duplicate = await prisma.unit.findFirst({
            where: { propertyId: unit.propertyId, unitNumber: data.unitNumber },
        });
        if (duplicate) throw new HttpError(409, "This property already has a unit with that number.");
    }

    return prisma.unit.update({ where: { id: unitId }, data });
}
