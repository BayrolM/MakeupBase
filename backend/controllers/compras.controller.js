import sql from "../config/db.js";

export const listar = async (req, res) => {
  try {
    const { q, estado, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Fragmento WHERE dinámico
    const whereFragment = sql`
      WHERE 1=1
      ${q ? sql`AND (p.nombre ILIKE ${'%' + q + '%'} OR c.id_compra::text ILIKE ${'%' + q + '%'})` : sql``}
      ${estado !== undefined && estado !== '' ? sql`AND c.estado = ${estado === 'true' || estado === '1'}` : sql``}
    `;

    const [{ total }] = await sql`
      SELECT COUNT(1) AS total
      FROM compras c
      LEFT JOIN proveedores p ON c.id_proveedor = p.id_proveedor
      ${whereFragment}
    `;

    const result = await sql`
      SELECT c.*, p.nombre as nombre_proveedor, u.nombre as nombre_usuario,
      (
        SELECT json_agg(dc)
        FROM (
          SELECT id_producto, cantidad, precio_unitario
          FROM detalle_compra
          WHERE id_compra = c.id_compra
        ) dc
      ) as productos
      FROM compras c
      LEFT JOIN proveedores p ON c.id_proveedor = p.id_proveedor
      LEFT JOIN usuarios u ON c.id_usuario_empleado = u.id_usuario
      ${whereFragment}
      ORDER BY c.fecha_compra DESC
      LIMIT ${parseInt(limit, 10)} OFFSET ${offset}
    `;

    return res.json({
      ok: true,
      total: parseInt(total, 10),
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error al obtener compras." });
  }
};

export const obtener = async (req, res) => {
  try {
    const { id } = req.params;
    const compra = await sql`
      SELECT c.*, p.nombre as nombre_proveedor, u.nombre as nombre_usuario
      FROM compras c
      LEFT JOIN proveedores p ON c.id_proveedor = p.id_proveedor
      LEFT JOIN usuarios u ON c.id_usuario_empleado = u.id_usuario
      WHERE c.id_compra = ${id}
    `;

    if (compra.length === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Compra no encontrada." });
    }

    const detalles = await sql`
      SELECT dc.*, pr.nombre as nombre_producto
      FROM detalle_compra dc
      LEFT JOIN productos pr ON dc.id_producto = pr.id_producto
      WHERE dc.id_compra = ${id}
    `;

    return res.json({
      ...compra[0],
      detalles,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ ok: false, message: "Error al obtener la compra." });
  }
};

export const crear = async (req, res) => {
  try {
    const { id_proveedor, items } = req.body;
    const id_usuario = req.user.id_usuario;

    if (
      !id_proveedor ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res
        .status(400)
        .json({
          ok: false,
          message: "Faltan datos requeridos (proveedor e ítems).",
        });
    }

    // Calcular totales (Sin IVA)
    let total = 0;
    items.forEach((item) => {
      total += item.cantidad * item.precio_unitario;
    });

    // Ejecutar transacción
    const resultado = await sql.begin(async (sql) => {
      // 1. Insertar la compra (IVA siempre 0)
      const [compra] = await sql`
        INSERT INTO compras (id_proveedor, id_usuario_empleado, fecha_compra, subtotal, iva, total, estado)
        VALUES (${id_proveedor}, ${id_usuario}, NOW(), ${total}, 0, ${total}, true)
        RETURNING *
      `;

      // 2. Insertar los detalles y actualizar stock
      for (const item of items) {
        await sql`
          INSERT INTO detalle_compra (id_compra, id_producto, cantidad, precio_unitario)
          VALUES (${compra.id_compra}, ${item.id_producto}, ${item.cantidad}, ${item.precio_unitario})
        `;

        // 3. Actualizar el stock FISICO del producto y el costo promedio
        await sql`
          UPDATE productos 
          SET stock_fisico = stock_fisico + ${item.cantidad},
              costo_promedio = ${item.precio_unitario}
          WHERE id_producto = ${item.id_producto}
        `;
      }

      return compra;
    });

    return res.status(201).json(resultado);
  } catch (error) {
    console.error("❌ ERROR en crear compra:", error);
    console.error("📋 Stack:", error.stack);
    return res
      .status(500)
      .json({
        ok: false,
        message: error.message || "Error al registrar la compra.",
      });
  }
};

export const anular = async (req, res) => {
  try {
    const { id } = req.params;

    await sql.begin(async (sql) => {
      // 1. Verificar existencia y estado
      const [compra] = await sql`
        SELECT * FROM compras WHERE id_compra = ${id}
      `;

      if (!compra) {
        throw new Error("Compra no encontrada.");
      }

      if (compra.estado === false) {
        throw new Error("La compra ya se encuentra anulada.");
      }

      // 2. Obtener los detalles de la compra para revertir el stock
      const detalles = await sql`
        SELECT id_producto, cantidad FROM detalle_compra WHERE id_compra = ${id}
      `;

      // 3. Revertir el stock FISICO restando lo que se había sumado
      for (const item of detalles) {
        await sql`
          UPDATE productos 
          SET stock_fisico = stock_fisico - ${item.cantidad}
          WHERE id_producto = ${item.id_producto}
        `;
      }

      // 4. Actualizar el estado a anulada (false)
      await sql`
        UPDATE compras SET estado = false WHERE id_compra = ${id}
      `;
    });

    return res.json({ ok: true, message: "Compra anulada correctamente." });
  } catch (error) {
    console.error(error);
    const msg =
      error.message === "Compra no encontrada." ||
      error.message === "La compra ya se encuentra anulada."
        ? error.message
        : "Error al anular la compra.";
    return res
      .status(msg === "Error al anular la compra." ? 500 : 400)
      .json({ ok: false, message: msg });
  }
};
