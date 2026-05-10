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

    // Si se intenta desactivar, verificar asociaciones y procesos
    if (estado === false) {
      const associatedProducts = await sql`SELECT id_producto FROM productos WHERE id_marca = ${id}`;
      
      if (associatedProducts.length > 0) {
        const productIds = associatedProducts.map(p => p.id_producto);
        const pendingOrders = await sql`
          SELECT p.id_pedido 
          FROM detalle_pedido dp
          INNER JOIN pedidos p ON dp.id_pedido = p.id_pedido
          WHERE dp.id_producto IN (${productIds})
          AND p.estado NOT IN ('entregado', 'cancelado')
          LIMIT 1
        `;

        if (pendingOrders.length > 0) {
          return res.status(400).json({
            ok: false,
            message: "No se puede desactivar la marca: tiene pedidos pendientes en proceso."
          });
        }
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

    // CASO B: Tiene productos, verificar procesos (pedidos)
    const productIds = associatedProducts.map(p => p.id_producto);
    
    // Buscar pedidos que contengan estos productos y su estado
    // Consideramos "pendiente" cualquier estado que no sea 'entregado' o 'cancelado'
    const pendingOrders = await sql`
      SELECT p.id_pedido, p.estado 
      FROM detalle_pedido dp
      INNER JOIN pedidos p ON dp.id_pedido = p.id_pedido
      WHERE dp.id_producto IN (${productIds})
      AND p.estado NOT IN ('entregado', 'cancelado')
    `;

    if (pendingOrders.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "No se puede eliminar ni desactivar la marca: tiene pedidos pendientes de proceso."
      });
    }

    // Si llegamos aquí, o no tiene pedidos o todos están entregados/cancelados
    // Pero como tiene productos, solo hacemos SOFT DELETE (desactivar)
    const result = await sql`
      UPDATE marcas SET estado = false WHERE id_marca = ${id} RETURNING *
    `;
    
    return res.json({ 
      ok: true, 
      message: "Marca desactivada correctamente (tiene registros históricos)." 
    });

  } catch (error) {
    console.error("❌ Error en eliminar marca:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Error al procesar la eliminación de la marca." });
  }
};
