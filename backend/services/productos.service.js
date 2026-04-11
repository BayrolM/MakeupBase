import sql from "../config/db.js";

/**
 * Filtros aceptados (query): q, marca, categoria, minPrice, maxPrice, estado
 * Paginación: page (1-based), limit
 */

export const listarProductos = async (filters = {}) => {
  const {
    q,
    marca,
    categoria,
    minPrice,
    maxPrice,
    estado,
    page = 1,
    limit = 10,
  } = filters;

  const offset = (page - 1) * limit;

  // Parsear estado si existe
  let estadoVal;
  if (typeof estado !== "undefined") {
    // Convertir a boolean para PostgreSQL
    estadoVal =
      estado === "1" || estado === 1 || estado === "true" || estado === true;
  }

  const whereFragment = sql`
    WHERE 1=1
    ${
      q
        ? sql`AND (p.nombre ILIKE ${"%" + q + "%"} OR p.descripcion ILIKE ${"%" + q + "%"} OR m.nombre ILIKE ${"%" + q + "%"} OR c.nombre ILIKE ${"%" + q + "%"})`
        : sql``
    }
    ${marca ? sql`AND p.id_marca = ${marca}` : sql``}
    ${categoria ? sql`AND p.id_categoria = ${categoria}` : sql``}
    ${minPrice ? sql`AND p.precio_venta >= ${minPrice}` : sql``}
    ${maxPrice ? sql`AND p.precio_venta <= ${maxPrice}` : sql``}
    ${
      typeof estado !== "undefined"
        ? sql`AND p.estado = ${estadoVal}`
        : sql``
    }
  `;

  // Contar total (Necesitamos los joins si filtramos por marca o categoría en 'q')
  const countResult =
    await sql`SELECT COUNT(1) AS total FROM productos p LEFT JOIN marcas m ON p.id_marca = m.id_marca LEFT JOIN categorias c ON p.id_categoria = c.id_categoria ${whereFragment}`;
  const total = parseInt(countResult[0].total, 10);

  // Obtener datos
  const items = await sql`
    SELECT
      p.id_producto, p.nombre, p.descripcion, p.id_marca, p.id_categoria,
      p.costo_promedio, p.precio_venta, p.stock_actual, p.stock_max, p.stock_min,
      p.imagen_url, p.estado, m.nombre as nombre_marca, c.nombre as nombre_categoria
    FROM productos p
    LEFT JOIN marcas m ON p.id_marca = m.id_marca
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    ${whereFragment}
    ORDER BY p.nombre
    LIMIT ${limit} OFFSET ${offset}
  `;

  return { total, page: parseInt(page, 10), limit: parseInt(limit, 10), items };
};

export const obtenerProductoPorId = async (id) => {
  const result = await sql`
      SELECT
        p.id_producto, p.nombre, p.descripcion, p.id_marca, p.id_categoria,
        p.costo_promedio, p.precio_venta, p.stock_actual, p.stock_max, p.stock_min,
        p.imagen_url, p.estado
      FROM productos p
      WHERE p.id_producto = ${id}
    `;
  return result[0] ?? null;
};

export const crearProducto = async (data) => {
  const {
    nombre,
    id_marca,
    id_categoria,
    descripcion,
    costo_promedio,
    precio_venta,
    stock_actual = 0,
    stock_max = 0,
    stock_min = 0,
    imagen_url,
    estado = 1,
  } = data;

  const result = await sql`
      INSERT INTO productos
        (nombre, id_marca, id_categoria, descripcion, costo_promedio, precio_venta, stock_actual, stock_max, stock_min, imagen_url, estado)
      VALUES
        (${nombre}, ${id_marca}, ${id_categoria}, ${descripcion}, ${costo_promedio}, ${precio_venta}, ${stock_actual}, ${stock_max}, ${stock_min}, ${imagen_url}, ${estado})
      RETURNING id_producto
    `;

  return { id_producto: result[0].id_producto };
};

export const actualizarProducto = async (id, data) => {
  const {
    nombre,
    id_marca,
    id_categoria,
    descripcion,
    costo_promedio,
    precio_venta,
    stock_actual,
    stock_max,
    stock_min,
    imagen_url,
    estado,
  } = data;

  // Si se intenta desactivar, verificar que no tenga asociaciones activas
  if (estado === false || estado === 0) {
    const [pedidosActivos] = await sql`
      SELECT COUNT(1) as total
      FROM detalle_pedido dp
      JOIN pedidos p ON dp.id_pedido = p.id_pedido
      WHERE dp.id_producto = ${id}
        AND p.estado NOT IN ('entregado', 'cancelado')
    `;
    const [ventasActivas] = await sql`
      SELECT COUNT(1) as total
      FROM detalle_ventas dv
      JOIN ventas v ON dv.id_venta = v.id_venta
      WHERE dv.id_producto = ${id}
        AND v.estado = true
    `;
    const totalActivos = parseInt(pedidosActivos.total) + parseInt(ventasActivas.total);
    if (totalActivos > 0) {
      const detalle = [];
      if (parseInt(pedidosActivos.total) > 0) detalle.push(`${pedidosActivos.total} pedido(s) activo(s)`);
      if (parseInt(ventasActivas.total) > 0) detalle.push(`${ventasActivas.total} venta(s) activa(s)`);
      throw Object.assign(
        new Error(`No se puede desactivar: el producto tiene ${detalle.join(' y ')}.`),
        { code: 'PRODUCT_HAS_ACTIVE_ASSOCIATIONS', status: 400 }
      );
    }
  }

  // Construir objeto de actualización
  const updateData = {};
  if (nombre !== undefined) updateData.nombre = nombre;
  if (id_marca !== undefined) updateData.id_marca = id_marca;
  if (id_categoria !== undefined) updateData.id_categoria = id_categoria;
  if (descripcion !== undefined) updateData.descripcion = descripcion;
  if (costo_promedio !== undefined) updateData.costo_promedio = costo_promedio;
  if (precio_venta !== undefined) updateData.precio_venta = precio_venta;
  if (stock_actual !== undefined) updateData.stock_actual = stock_actual;
  if (stock_max !== undefined) updateData.stock_max = stock_max;
  if (stock_min !== undefined) updateData.stock_min = stock_min;
  if (imagen_url !== undefined) updateData.imagen_url = imagen_url;
  if (estado !== undefined) updateData.estado = estado;

  if (Object.keys(updateData).length === 0) return false;

  await sql`
    UPDATE productos SET
      ${sql(updateData)}
    WHERE id_producto = ${id}
  `;

  return true;
};

export const eliminarProducto = async (id) => {
  // Verificar pedidos activos (no entregado ni cancelado) que contengan este producto
  const [pedidosActivos] = await sql`
    SELECT COUNT(1) as total
    FROM detalle_pedido dp
    JOIN pedidos p ON dp.id_pedido = p.id_pedido
    WHERE dp.id_producto = ${id}
      AND p.estado NOT IN ('entregado', 'cancelado')
  `;

  // Verificar ventas activas (no anuladas) que contengan este producto
  const [ventasActivas] = await sql`
    SELECT COUNT(1) as total
    FROM detalle_ventas dv
    JOIN ventas v ON dv.id_venta = v.id_venta
    WHERE dv.id_producto = ${id}
      AND v.estado = true
  `;

  const totalActivos = parseInt(pedidosActivos.total) + parseInt(ventasActivas.total);

  if (totalActivos > 0) {
    const detalle = [];
    if (parseInt(pedidosActivos.total) > 0)
      detalle.push(`${pedidosActivos.total} pedido(s) activo(s)`);
    if (parseInt(ventasActivas.total) > 0)
      detalle.push(`${ventasActivas.total} venta(s) activa(s)`);

    throw Object.assign(
      new Error(`No se puede eliminar ni desactivar: el producto tiene ${detalle.join(' y ')}.`),
      { code: 'PRODUCT_HAS_ACTIVE_ASSOCIATIONS', status: 400 }
    );
  }

  // Sin asociaciones activas → eliminar definitivamente
  await sql`DELETE FROM productos WHERE id_producto = ${id}`;
  return { hardDeleted: true, message: "Producto eliminado definitivamente" };
};

export const productosDestacados = async (limit = 10) => {
  const items = await sql`
      SELECT
        id_producto, nombre, descripcion, id_marca, id_categoria,
        costo_promedio, precio_venta, stock_actual, stock_max, stock_min, imagen_url, estado
      FROM productos
      WHERE estado = 1
      ORDER BY stock_actual DESC, precio_venta DESC
      LIMIT ${limit}
    `;
  return items;
};
