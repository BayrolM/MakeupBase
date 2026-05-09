import sql from './config/db.js';

async function debug() {
  const sales = await sql`
    SELECT id_venta, fecha_venta, total, estado 
    FROM ventas 
    ORDER BY fecha_venta DESC
  `;
  console.log('--- Ventas registradas ---');
  console.table(sales);
  process.exit();
}

debug();
