import sql from './config/db.js';

async function main() {
  const rows = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'perdidas'`;
  console.log(rows);
  process.exit(0);
}

main();
