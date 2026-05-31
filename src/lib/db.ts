import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const databaseUrl = "file:./prisma/dev.db";

export function createDbClient() {
  const adapter = new PrismaBetterSqlite3({
    url: databaseUrl,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db =
  globalForPrisma.prisma ?? createDbClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
