import sql from './backend/config/db.js';

async function check() {
  const verif = await sql`SELECT * FROM usuario_verificaciones`;
  console.log("Verificaciones:", verif);
  process.exit(0);
}
check();
