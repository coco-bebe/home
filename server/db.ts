import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "../shared/schema.ts";
import "dotenv/config";

// Get database URL from environment variable
// Neon PostgreSQL format: postgresql://username:password@host/database?sslmode=require&channel_binding=require
const getDatabaseUrl = (): string => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set. Please configure Neon PostgreSQL connection.");
  }
  return process.env.DATABASE_URL;
};

const connectionString = getDatabaseUrl();

// Log connection string (without password) for debugging
const maskedUrl = connectionString.replace(/:[^:@]+@/, ":****@");
console.log(`[DB] Connecting to database: ${maskedUrl}`);

// Create a connection pool with connection timeout
const pool = new Pool({ 
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection and check if tables exist
let dbConnected = false;
let dbTablesExist = false;
let dbError: Error | null = null;

// Test connection asynchronously
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("[DB] Database connection successful");
    dbConnected = true;
    
    // Check if tables exist
    try {
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('posts', 'album_photos', 'app_users', 'teachers', 'classes', 'registered_children', 'site_settings')
        LIMIT 1
      `);
      if (result.rows && result.rows.length > 0) {
        console.log("[DB] Database tables exist");
        dbTablesExist = true;
      } else {
        console.warn("[DB] Database tables do not exist. Run 'npm run db:push' to create them.");
        dbTablesExist = false;
      }
    } catch (tableErr: any) {
      console.warn("[DB] Could not check tables:", tableErr.message);
      dbTablesExist = false;
    }
  } catch (err: any) {
    console.error("[DB] Database connection failed:", err.message);
    console.error("[DB] Error code:", err.code);
    console.error("[DB] =========================================");
    console.error("[DB] 데이터베이스 연결에 실패했습니다.");
    console.error("[DB] 해결 방법:");
    console.error("[DB] 1. DATABASE_URL 환경 변수를 설정하세요:");
    console.error("[DB]    export DATABASE_URL='postgresql://user:pass@host:port/db?sslmode=require'");
    console.error("[DB] 2. 또는 개별 환경 변수를 설정하세요:");
    console.error("[DB]    export DB_HOST='your-host'");
    console.error("[DB]    export DB_PASSWORD='your-password'");
    console.error("[DB] 3. Render.com 대시보드에서 'External Database URL'을 확인하세요");
    console.error("[DB] =========================================");
    dbConnected = false;
    dbTablesExist = false;
    dbError = err;
  }
})();

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Export connection status
export const isDbConnected = () => dbConnected;
export const doTablesExist = () => dbTablesExist;
export const getDbError = () => dbError;
export { pool };

