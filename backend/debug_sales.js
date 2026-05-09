import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function check() {
  const r = await sql`SELECT EXTRACT(YEAR FROM fecha_venta) as anio, TO_CHAR(fecha_venta, 'MM') as mes, COUNT(*), SUM(total) FROM ventas GROUP BY anio, mes ORDER BY anio, mes`;
  console.table(r);
  process.exit(0);
}
check();
