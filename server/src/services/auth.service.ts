import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

export async function registerUser(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
}) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return null; // email already used

    const passwordHash = await bcrypt.hash(data.password, 10);

    // Public sign-up creates landlords. Landlords create tenants later.
    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            passwordHash,
            role: "LANDLORD",
        },
        select: { id: true, name: true, email: true, role: true }, // never return passwordHash
    });

    return user;
}