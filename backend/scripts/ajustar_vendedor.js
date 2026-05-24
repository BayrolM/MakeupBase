import sql from '../config/db.js';

async function ajustarPermisosVendedor() {
  const ID_ROL_VENDEDOR = 14;
  const permisosPermitidos = [
    // Productos
    10, // ver_productos
    // Ventas
    14, // ver_ventas
    15, // crear_ventas
    // Pedidos
    22, // ver_pedidos
    23, // crear_pedidos
    24, // editar_pedidos
    // Clientes
    26, // ver_clientes
    27, // crear_clientes
    28, // editar_clientes
    // Devoluciones
    34, // ver_devoluciones
    35, // crear_devoluciones
    36, // editar_devoluciones
    // Marcas
    42, // ver_marcas
  ];

  try {
    console.log(`Iniciando ajuste de permisos para el rol Vendedor (ID: ${ID_ROL_VENDEDOR})`);

    // 1. Eliminar permisos actuales
    await sql`DELETE FROM roles_permisos WHERE id_rol = ${ID_ROL_VENDEDOR}`;
    console.log('Permisos anteriores eliminados.');

    // 2. Insertar nuevos permisos permitidos
    for (const p of permisosPermitidos) {
      await sql`INSERT INTO roles_permisos (id_rol, id_permiso) VALUES (${ID_ROL_VENDEDOR}, ${p})`;
    }
    console.log('Nuevos permisos asignados exitosamente.');
    
    // Verificar los permisos actuales
    const actuales = await sql`
      SELECT p.nombre 
      FROM roles_permisos rp 
      JOIN permisos p ON rp.id_permiso = p.id_permiso 
      WHERE rp.id_rol = ${ID_ROL_VENDEDOR}
    `;
    console.log('Permisos actuales del Vendedor:', actuales.map(a => a.nombre));

  } catch (err) {
    console.error('Error al ajustar permisos:', err);
  } finally {
    process.exit(0);
  }
}

ajustarPermisosVendedor();
