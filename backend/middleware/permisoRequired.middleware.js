import sql from "../config/db.js";

export const tienePermiso = (nombrePermiso) => {
  return async (req, res, next) => {
    console.log(`🛡️ [tienePermiso] Verificando permiso: ${nombrePermiso}`);

    try {
      if (!req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }

      // Si el rol es 1 (Administrador), tiene acceso total automático
      if (req.user.rol === 1) {
        console.log(`👑 [tienePermiso] Usuario es Administrador (Rol 1). Acceso total.`);
        return next();
      }

      // Si los permisos ya vienen en el token, los usamos directamente
      if (req.user.permisos && Array.isArray(req.user.permisos)) {
        if (req.user.permisos.includes(nombrePermiso)) {
          console.log(`✅ [tienePermiso] Permiso ${nombrePermiso} verificado desde el token JWT.`);
          return next();
        } else {
          console.log(`❌ [tienePermiso] El token JWT no contiene el permiso: ${nombrePermiso}`);
          return res.status(403).json({
            message: `Acceso denegado. Se requiere el permiso: ${nombrePermiso}`
          });
        }
      }

      // Consultar en la base de datos si el rol tiene asignado este permiso
      const permisoAsignado = await sql`
        SELECT 1
        FROM roles_permisos rp
        JOIN permisos p ON rp.id_permiso = p.id_permiso
        WHERE rp.id_rol = ${req.user.rol} 
          AND p.nombre = ${nombrePermiso}
          AND p.estado = true
      `;

      if (permisoAsignado.length === 0) {
        console.log(`❌ [tienePermiso] Rol ${req.user.rol} no tiene el permiso: ${nombrePermiso}`);
        return res.status(403).json({
          message: `Acceso denegado. Se requiere el permiso: ${nombrePermiso}`
        });
      }

      console.log(`✅ [tienePermiso] Permiso ${nombrePermiso} verificado para Rol ${req.user.rol}`);
      next();
    } catch (error) {
      console.error(`💥 [tienePermiso] Error al validar permiso:`, error);
      return res.status(500).json({ message: "Error interno al validar permisos" });
    }
  };
};

export const tienePermisoUsuarioOCliente = (accion) => {
  return async (req, res, next) => {
    console.log(`🛡️ [tienePermisoUsuarioOCliente] Verificando acción: ${accion}`);

    try {
      if (!req.user) {
        return res.status(401).json({ message: "No autenticado" });
      }

      // Si el rol es 1 (Administrador), tiene acceso total automático
      if (req.user.rol === 1) {
        console.log(`👑 [tienePermisoUsuarioOCliente] Usuario es Administrador (Rol 1). Acceso total.`);
        return next();
      }

      // Determinar si la petición es sobre un "cliente" (rol 2) o un "usuario" (cualquier otro rol)
      let esCliente = false;

      // Caso 1: Creación (POST /) -> el body trae id_rol
      if (req.method === "POST" && req.body && Number(req.body.id_rol) === 2) {
        esCliente = true;
      }
      // Caso 2: Listado (GET /) -> la query trae id_rol
      else if (req.method === "GET" && req.query && Number(req.query.id_rol) === 2) {
        esCliente = true;
      }
      // Caso 3: Operaciones sobre un ID específico (GET, PUT, DELETE /:id)
      else if (req.params && req.params.id) {
        const targetUserId = req.params.id;
        // Consultar el rol del usuario destino
        const targetUser = await sql`
          SELECT id_rol FROM usuarios WHERE id_usuario = ${targetUserId}
        `;
        if (targetUser && targetUser.length > 0 && targetUser[0].id_rol === 2) {
          esCliente = true;
        }
      }

      // Definir el permiso necesario según sea cliente o usuario
      const permisoRequerido = esCliente ? `${accion}_clientes` : `${accion}_usuarios`;
      console.log(`🛡️ [tienePermisoUsuarioOCliente] Destino es ${esCliente ? "Cliente" : "Usuario"}. Permiso requerido: ${permisoRequerido}`);

      // Verificar si el usuario tiene ese permiso
      if (req.user.permisos && Array.isArray(req.user.permisos)) {
        if (req.user.permisos.includes(permisoRequerido)) {
          console.log(`✅ [tienePermisoUsuarioOCliente] Permiso ${permisoRequerido} verificado desde el token JWT.`);
          return next();
        }
      } else {
        // Consultar en base de datos si no viene en el token
        const permisoAsignado = await sql`
          SELECT 1
          FROM roles_permisos rp
          JOIN permisos p ON rp.id_permiso = p.id_permiso
          WHERE rp.id_rol = ${req.user.rol} 
            AND p.nombre = ${permisoRequerido}
            AND p.estado = true
        `;
        if (permisoAsignado.length > 0) {
          console.log(`✅ [tienePermisoUsuarioOCliente] Permiso ${permisoRequerido} verificado para Rol ${req.user.rol}`);
          return next();
        }
      }

      // Si no tiene el permiso, denegar
      console.log(`❌ [tienePermisoUsuarioOCliente] Rol ${req.user.rol} no tiene el permiso: ${permisoRequerido}`);
      return res.status(403).json({
        message: `Acceso denegado. Se requiere el permiso: ${permisoRequerido}`
      });

    } catch (error) {
      console.error(`💥 [tienePermisoUsuarioOCliente] Error al validar permiso:`, error);
      return res.status(500).json({ message: "Error interno al validar permisos" });
    }
  };
};
