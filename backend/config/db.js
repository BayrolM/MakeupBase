import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const sql = postgres(connectionString, {
  prepare: false, // Desactivar prepared statements para compatibilidad con poolers (Supabase/PgBouncer)
});

export default sql;
