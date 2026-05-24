import sql from '../config/db.js';

async function listRoles() {
  const roles = await sql`SELECT * FROM roles`;
  console.log('Roles:', roles);
  
  const permisos = await sql`SELECT * FROM permisos`;
  console.log('Permisos:', permisos);
  
  process.exit(0);
}

listRoles();
