import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { env } from "../config/env.js";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function assertDatabaseConnection(): Promise<void> {
  await prisma.$connect();
  console.log("Database Connected Successfully");
}

async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export { prisma, assertDatabaseConnection, disconnectDatabase };
