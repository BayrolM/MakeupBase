import sql from "../config/db.js";

/**
 * Listar todos los roles con filtros opcionales
 */
export const listarRoles = async (req, res) => {
  try {
    const { q, estado } = req.query;

    let query = sql`SELECT * FROM roles WHERE 1=1`;

    // Filtro de búsqueda por nombre o descripción
    if (q) {
      query = sql`
        SELECT * FROM roles 
        WHERE (nombre ILIKE ${"%" + q + "%"} OR descripcion ILIKE ${"%" + q + "%"
        })
      `;
    }

    // Filtro por estado
    if (estado !== undefined) {
      const estadoBool = estado === "true" || estado === "1";
      if (q) {
        query = sql`
          SELECT * FROM roles 
          WHERE (nombre ILIKE ${"%" + q + "%"} OR descripcion ILIKE ${"%" + q + "%"
          })
            AND estado = ${estadoBool}
        `;
      } else {
        query = sql`SELECT * FROM roles WHERE estado = ${estadoBool}`;
      }
    }

    const roles = await query;

    // Obtener todos los permisos asignados para adjuntarlos
    const rolesIds = roles.map(r => r.id_rol);
    let rolesPermisosMap = {};
    
    if (rolesIds.length > 0) {
      const permisosAsignados = await sql`
        SELECT rp.id_rol, p.id_permiso, p.nombre, p.modulo, p.descripcion
        FROM roles_permisos rp
        JOIN permisos p ON rp.id_permiso = p.id_permiso
        WHERE rp.id_rol IN ${sql(rolesIds)}
      `;

      permisosAsignados.forEach(row => {
        if (!rolesPermisosMap[row.id_rol]) {
          rolesPermisosMap[row.id_rol] = [];
        }
        rolesPermisosMap[row.id_rol].push({
          id_permiso: row.id_permiso,
          nombre: row.nombre,
          modulo: row.modulo,
          descripcion: row.descripcion
        });
      });
    }

    const rolesConPermisos = roles.map(r => ({
      ...r,
      permisos_asignados: rolesPermisosMap[r.id_rol] || []
    }));

    return res.json({
      ok: true,
      total: rolesConPermisos.length,
      data: rolesConPermisos,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener roles",
    });
  }
};

/**
 * Obtener detalle de un rol específico
 */
export const obtenerRol = async (req, res) => {
  try {
    const { id } = req.params;

    const rol = await sql`
      SELECT * FROM roles WHERE id_rol = ${id}
    `;

    if (rol.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Rol no encontrado",
      });
    }

    // Obtener cantidad de usuarios con este rol
    const usuarios = await sql`
      SELECT COUNT(*) as total FROM usuarios WHERE id_rol = ${id}
    `;

    // Obtener permisos asignados
    const permisos_asignados = await sql`
      SELECT p.id_permiso, p.nombre, p.modulo, p.descripcion
      FROM roles_permisos rp
      JOIN permisos p ON rp.id_permiso = p.id_permiso
      WHERE rp.id_rol = ${id}
    `;

    return res.json({
      ok: true,
      data: {
        ...rol[0],
        total_usuarios: parseInt(usuarios[0].total),
        permisos_asignados: permisos_asignados,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener el rol",
    });
  }
};

/**
 * Crear un nuevo rol
 */
export const crearRol = async (req, res) => {
  try {
    const { nombre, descripcion, estado = true } = req.body;

    // Validar nombre requerido
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El nombre del rol es requerido",
      });
    }

    const nombreTrimmed = nombre.trim();

    // Validar longitud máxima de 30 caracteres
    if (nombreTrimmed.length > 30) {
      return res.status(400).json({
        ok: false,
        message: "El nombre del rol no puede superar los 30 caracteres",
      });
    }

    // Verificar si ya existe un rol con ese nombre (case-insensitive)
    const existe = await sql`
      SELECT id_rol FROM roles WHERE LOWER(nombre) = LOWER(${nombreTrimmed})
    `;

    if (existe.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Ya existe un rol con ese nombre",
      });
    }

    const nuevoRol = await sql`
      INSERT INTO roles (nombre, descripcion, estado, created_at)
      VALUES (${nombreTrimmed}, ${descripcion?.trim() || null}, ${estado}, NOW())
      RETURNING *
    `;

    return res.status(201).json({
      ok: true,
      message: "Rol creado correctamente",
      data: nuevoRol[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error al crear el rol",
    });
  }
};

/**
 * Actualizar un rol existente
 */
export const actualizarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;

    // Verificar que el rol existe
    const rolExiste = await sql`
      SELECT * FROM roles WHERE id_rol = ${id}
    `;

    if (rolExiste.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Rol no encontrado",
      });
    }

    // Si se está cambiando el nombre, verificar que no sea un rol interno y que no exista otro con ese nombre
    if (nombre && nombre.trim() !== rolExiste[0].nombre) {
      // Validar roles internos (1: Administrador, 2: Cliente)
      const rolesInternos = [1, 2];
      if (rolesInternos.includes(parseInt(id))) {
        return res.status(403).json({
          ok: false,
          message: "No se permite cambiar el nombre de los roles internos del sistema",
        });
      }

      const nombreTrimmed = nombre.trim();

      if (nombreTrimmed.length > 30) {
        return res.status(400).json({
          ok: false,
          message: "El nombre del rol no puede superar los 30 caracteres",
        });
      }

      const nombreExiste = await sql`
        SELECT id_rol FROM roles WHERE LOWER(nombre) = LOWER(${nombreTrimmed}) AND id_rol != ${id}
      `;

      if (nombreExiste.length > 0) {
        return res.status(400).json({
          ok: false,
          message: "Ya existe otro rol con ese nombre",
        });
      }
    }

    const nombreFinal = nombre ? nombre.trim() : rolExiste[0].nombre;

    // Si se está cambiando el estado de un rol interno, no permitir desactivarlo
    if (estado === false) {
      const rolesInternos = [1, 2];
      if (rolesInternos.includes(parseInt(id))) {
        return res.status(403).json({
          ok: false,
          message: "No se permite desactivar los roles internos del sistema",
        });
      }
    }

    const rolActualizado = await sql`
      UPDATE roles
      SET 
        nombre = ${nombreFinal},
        descripcion = ${descripcion !== undefined ? (descripcion?.trim() || null) : rolExiste[0].descripcion
      },
        estado = ${estado !== undefined ? estado : rolExiste[0].estado}
      WHERE id_rol = ${id}
      RETURNING *
    `;

    return res.json({
      ok: true,
      message: "Rol actualizado correctamente",
      data: rolActualizado[0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error al actualizar el rol",
    });
  }
};

/**
 * Eliminar un rol existente
 */
export const eliminarRol = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el rol existe
    const rolExiste = await sql`SELECT * FROM roles WHERE id_rol = ${id}`;
    if (rolExiste.length === 0) {
      return res.status(404).json({ ok: false, message: "Rol no encontrado" });
    }

    // Verificar si es un rol interno
    const rolesInternos = [1, 2];
    if (rolesInternos.includes(parseInt(id))) {
      return res.status(403).json({ ok: false, message: "No se permite eliminar roles internos del sistema" });
    }

    // Verificar si hay dependencias (usuarios)
    const usuarios = await sql`SELECT COUNT(*) as total FROM usuarios WHERE id_rol = ${id}`;
    if (parseInt(usuarios[0].total) > 0) {
      return res.status(400).json({ ok: false, message: "No se puede eliminar el rol porque tiene usuarios asignados" });
    }

    // Eliminar relaciones de permisos en cascada antes de eliminar el rol
    await sql`DELETE FROM roles_permisos WHERE id_rol = ${id}`;
    
    // Eliminar el rol
    await sql`DELETE FROM roles WHERE id_rol = ${id}`;

    return res.json({ ok: true, message: "Rol eliminado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al eliminar el rol" });
  }
};

/**
 * Asignar permisos a un rol
 */
export const asignarPermisos = async (req, res) => {
  try {
    const { id } = req.params; // id_rol
    const { permisos } = req.body; // array de id_permiso

    if (!Array.isArray(permisos) || permisos.length === 0) {
      return res.status(400).json({ ok: false, message: "Debe seleccionar al menos un permiso" });
    }

    // Remover duplicados del array entrante
    const permisosUnicos = [...new Set(permisos)];

    // Verificar que el rol existe
    const rolExiste = await sql`SELECT id_rol FROM roles WHERE id_rol = ${id}`;
    if (rolExiste.length === 0) {
      return res.status(404).json({ ok: false, message: "Rol no encontrado" });
    }

    // Verificar que los permisos existen en la tabla permisos
    const permisosBD = await sql`SELECT id_permiso FROM permisos WHERE id_permiso IN ${sql(permisosUnicos)}`;
    if (permisosBD.length !== permisosUnicos.length) {
      return res.status(400).json({ ok: false, message: "Uno o más permisos son inválidos" });
    }

    // Verificar cuáles ya están asignados
    const asignados = await sql`SELECT id_permiso FROM roles_permisos WHERE id_rol = ${id} AND id_permiso IN ${sql(permisosUnicos)}`;
    if (asignados.length > 0) {
      return res.status(400).json({ ok: false, message: "Algunos de los permisos ya están asignados a este rol" });
    }

    // Insertar
    for (const p of permisosUnicos) {
      await sql`INSERT INTO roles_permisos (id_rol, id_permiso) VALUES (${id}, ${p})`;
    }

    return res.json({ ok: true, message: "Permisos asignados correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al asignar permisos" });
  }
};

/**
 * Listar todos los permisos disponibles
 */
export const listarPermisos = async (req, res) => {
  try {
    const { page = 1, limit = 100, q = "", modulo = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Base query
    let baseQuery = sql`SELECT * FROM permisos`;
    let countQuery = sql`SELECT COUNT(*) FROM permisos`;

    const conditions = [];

    if (q) {
      const searchPattern = `%${q}%`;
      conditions.push(sql`(nombre ILIKE ${searchPattern} OR descripcion ILIKE ${searchPattern})`);
    }

    if (modulo) {
      conditions.push(sql`modulo = ${modulo}`);
    }

    if (conditions.length > 0) {
      const whereClause = conditions.reduce((acc, condition, index) => {
        if (index === 0) return sql`WHERE ${condition}`;
        return sql`${acc} AND ${condition}`;
      }, sql``);

      baseQuery = sql`${baseQuery} ${whereClause}`;
      countQuery = sql`${countQuery} ${whereClause}`;
    }

    const permisos = await sql`${baseQuery} ORDER BY id_permiso ASC LIMIT ${limitNum} OFFSET ${offset}`;
    const totalResult = await countQuery;
    const total = parseInt(totalResult[0].count);

    return res.json({
      ok: true,
      data: permisos,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener permisos",
    });
  }
};

/**
 * Eliminar permiso de un rol
 */
export const eliminarPermiso = async (req, res) => {
  try {
    const { id, id_permiso } = req.params;

    // Verificar que el rol existe
    const rolExiste = await sql`SELECT id_rol FROM roles WHERE id_rol = ${id}`;
    if (rolExiste.length === 0) {
      return res.status(404).json({ ok: false, message: "Rol no encontrado" });
    }

    // Verificar que el permiso existe
    const permisoExiste = await sql`SELECT id_permiso FROM permisos WHERE id_permiso = ${id_permiso}`;
    if (permisoExiste.length === 0) {
      return res.status(404).json({ ok: false, message: "Permiso no encontrado" });
    }

    // Validar asignación
    const asignado = await sql`SELECT id_permiso FROM roles_permisos WHERE id_rol = ${id} AND id_permiso = ${id_permiso}`;
    if (asignado.length === 0) {
      return res.status(400).json({ ok: false, message: "El permiso no está asignado a este rol" });
    }

    // Validar que no quede sin permisos (al menos debe tener 1)
    const totalPermisos = await sql`SELECT COUNT(*) FROM roles_permisos WHERE id_rol = ${id}`;
    if (parseInt(totalPermisos[0].count) <= 1) {
      return res.status(400).json({ ok: false, message: "No se puede dejar el rol sin permisos" });
    }

    await sql`DELETE FROM roles_permisos WHERE id_rol = ${id} AND id_permiso = ${id_permiso}`;

    return res.json({ ok: true, message: "Permiso eliminado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al eliminar permiso del rol" });
  }
};
