// Import PostgreSQL connection pool and Prisma driver adapter
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Read the PostgreSQL database URL from the environment
const connectionString = process.env.DATABASE_URL;

// Create a PostgreSQL connection pool
const pool = new Pool({ connectionString });

// Wrap the pool with Prisma's PostgreSQL adapter
const adapter = new PrismaPg(pool);

// Store the client on globalThis during development to prevent creating too many connections during hot-reloads
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Export a single PrismaClient instance (Singleton pattern)
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

// Cache instance globally in non-production environments
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
