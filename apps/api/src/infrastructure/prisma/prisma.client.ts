import { PrismaClient } from "@prisma/client";

// Prisma Client singleton.
// In development, hot-reloading creates new PrismaClient instances on every
// file change. Storing the client on `globalThis` prevents connection leaks.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
