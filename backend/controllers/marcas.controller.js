import sql from "../config/db.js";

//Listar marcas
export const listar = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = q 
      ? sql`WHERE nombre ILIKE ${'%' + q + '%'} OR descripcion ILIKE ${'%' + q + '%'}`
      : sql``;

    const totalResult = await sql`SELECT COUNT(1) as total FROM marcas ${whereClause}`;
    const total = parseInt(totalResult[0].total, 10);

    const marcas = await sql`
      SELECT * FROM marcas 
      ${whereClause}
      ORDER BY id_marca DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return res.json({
      ok: true,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      data: marcas
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ ok: false, message: "Error al obtener marcas." });
  }
};

//Obtener marca por id
export const obtener = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`SELECT * FROM marcas WHERE id_marca = ${id}`;
    if (result.length === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Marca no encontrada." });
    }
    return res.json(result[0]);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ ok: false, message: "Error al obtener la marca." });
  }
};

//Crear marca
export const crear = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res
        .status(400)
        .json({ ok: false, message: "El nombre es obligatorio." });
    }
    const result = await sql`
      INSERT INTO marcas (nombre, descripcion, estado)
      VALUES (${nombre}, ${descripcion || ""}, true)
      RETURNING *
    `;
    return res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ ok: false, message: "Error al crear la marca." });
  }
};

//Actualizar marca
export const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado } = req.body;

    // Si se intenta desactivar, verificar asociaciones
    if (estado === false) {
      const associatedProducts = await sql`SELECT id_producto FROM productos WHERE id_marca = ${id}`;
      
      if (associatedProducts.length > 0) {
        return res.status(400).json({
          ok: false,
          message: "No se puede desactivar la marca: está asociada a uno o más productos."
        });
      }
    }

    // Construir objeto de actualización parcial
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (estado !== undefined) updateData.estado = estado;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ ok: false, message: "No hay campos para actualizar." });
    }

    const result = await sql`
      UPDATE marcas
      SET ${sql(updateData)}
      WHERE id_marca = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Marca no encontrada." });
    }

    return res.json(result[0]);
  } catch (error) {
    console.error("❌ Error en actualizar marca:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Error al actualizar la marca en la base de datos." });
  }
};

//Eliminar marca (Hard or Soft delete based on associations)
export const eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Verificar productos asociados
    const associatedProducts = await sql`SELECT id_producto FROM productos WHERE id_marca = ${id}`;
    
    // CASO A: No tiene nada asociado (ni productos) -> ELIMINAR POR COMPLETO
    if (associatedProducts.length === 0) {
      const result = await sql`DELETE FROM marcas WHERE id_marca = ${id} RETURNING *`;
      if (result.length === 0) {
        return res.status(404).json({ ok: false, message: "Marca no encontrada." });
      }
      return res.json({ ok: true, message: "Marca eliminada permanentemente (sin asociaciones)." });
    }

    // CASO B: Tiene productos, no permitir eliminar
    return res.status(400).json({
      ok: false,
      message: "No se puede eliminar la marca: está asociada a uno o más productos."
    });

  } catch (error) {
    console.error("❌ Error en eliminar marca:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Error al procesar la eliminación de la marca." });
  }
};
