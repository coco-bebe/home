import { defineConfig } from "drizzle-kit";

// Get database URL from environment variable
// Neon PostgreSQL format: postgresql://username:password@host/database?sslmode=require&channel_binding=require
const getDatabaseUrl = (): string => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set. Please configure Neon PostgreSQL connection.");
  }
  return process.env.DATABASE_URL;
};

export default defineConfig({
  dialect: "postgresql",
  schema: "./shared/schema.ts",
  out: "./migrations",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
