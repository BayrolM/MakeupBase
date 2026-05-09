import sql from '../backend/config/db.js';

async function checkSchema() {
  try {
    const res = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'ventas'`;
    console.log(res);
  } catch (err) {
    console.error(err);
  }
  process.exit();
}

checkSchema();
