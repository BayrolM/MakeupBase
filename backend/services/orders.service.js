import sql from '../config/db.js';

/**
 * Crear una nueva orden desde el carrito
 */
export const crearOrden = async (id_usuario, datosEnvio) => {
  const { direccion, ciudad, metodo_pago } = datosEnvio;

  // Obtener el carrito actual
  const carrito = await sql`
    SELECT * FROM pedidos 
    WHERE id_usuario_cliente = ${id_usuario} AND estado = 'carrito'
    LIMIT 1
  `;

  if (carrito.length === 0) {
    throw new Error('No hay items en el carrito');
  }

  const id_pedido = carrito[0].id_pedido;

  // Obtener items del carrito
  const items = await sql`
    SELECT dp.*, p.stock_actual
    FROM detalle_pedido dp
    INNER JOIN productos p ON dp.id_producto = p.id_producto
    WHERE dp.id_pedido = ${id_pedido}
  `;

  if (items.length === 0) {
    throw new Error('El carrito está vacío');
  }

  // Verificar stock de todos los productos
  for (const item of items) {
    if (item.stock_actual < item.cantidad) {
      throw new Error(
        `Stock insuficiente para el producto ID ${item.id_producto}`
      );
    }
  }

  // Calcular total
  const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

  // Usar transacción para asegurar que todo se guarde bien
  return await sql.begin(async (sql) => {
    // 1. Actualizar el pedido de 'carrito' a 'pendiente'
    await sql`
      UPDATE pedidos 
      SET estado = 'pendiente',
          direccion = ${direccion},
          ciudad = ${ciudad},
          total = ${total},
          fecha_pedido = NOW()
      WHERE id_pedido = ${id_pedido}
    `;

    // 2. Reducir stock
    for (const item of items) {
      console.log(`📦 Reduciendo stock (Carrito) para Producto ID ${item.id_producto}: ${item.stock_actual} -> ${item.stock_actual - item.cantidad}`);
      await sql`
        UPDATE productos 
        SET stock_actual = stock_actual - ${item.cantidad}
        WHERE id_producto = ${item.id_producto}
      `;
    }

    return {
      id_pedido,
      total,
      estado: 'pendiente',
    };
  });
};

/**
 * Crear una nueva orden directamente desde el panel (sin pasar por carrito)
 */
export const crearOrdenDirecta = async (id_cliente, id_empleado, datosEnvio) => {
  const { direccion, ciudad, metodo_pago, items } = datosEnvio;

  if (!items || items.length === 0) {
    throw new Error('El pedido debe contener al menos un producto');
  }

  // Verificar stock y calcular subtotales de todos los productos
  let total = 0;
  const itemsValidados = [];
  
  for (const item of items) {
    const p = await sql`SELECT precio_venta, stock_actual FROM productos WHERE id_producto = ${item.id_producto}`;
    if (p.length === 0) throw new Error(`Producto ID ${item.id_producto} no encontrado`);
    
    if (p[0].stock_actual < item.cantidad) {
      throw new Error(`Stock insuficiente para el producto ID ${item.id_producto}`);
    }
    
    const subtotal = p[0].precio_venta * item.cantidad;
    total += subtotal;
    
    itemsValidados.push({
      ...item,
      precio_unitario: p[0].precio_venta,
      subtotal
    });
  }

  // Usar transacción para asegurar que todo se guarde bien
  return await sql.begin(async (sql) => {
    // 1. Crear el Pedido directamente en estado 'pendiente'
    const [pedido] = await sql`
      INSERT INTO pedidos (id_usuario_cliente, id_usuario_empleado, fecha_pedido, direccion, ciudad, subtotal, iva, total, metodo_pago, estado)
      VALUES (${id_cliente}, ${id_empleado}, NOW(), ${direccion}, ${ciudad}, ${total}, 0, ${total}, ${metodo_pago}, 'pendiente')
      RETURNING id_pedido
    `;
    const id_pedido = pedido.id_pedido;

    // 2. Insertar los detalles del pedido
    for (const item of itemsValidados) {
      await sql`
        INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
        VALUES (${id_pedido}, ${item.id_producto}, ${item.cantidad}, ${item.precio_unitario}, ${item.subtotal})
      `;
    }

    // 3. Reducir stock
    for (const item of itemsValidados) {
      console.log(`📦 Reduciendo stock (Directo) para Producto ID ${item.id_producto}: ${item.stock_actual} -> ${item.stock_actual - item.cantidad}`);
      await sql`
        UPDATE productos 
        SET stock_actual = stock_actual - ${item.cantidad}
        WHERE id_producto = ${item.id_producto}
      `;
    }

    return {
      id_pedido,
      total,
      estado: 'pendiente',
    };
  });
};

/**
 * ✅ MODIFICADO: Obtener historial de órdenes del usuario
 * Si es admin (rol = 1), obtiene TODAS las órdenes
 * Si es usuario normal, solo sus órdenes
 */
export const obtenerOrdenes = async (id_usuario, rol = null, estado = null) => {
  console.log(`📦 obtenerOrdenes - Usuario: ${id_usuario}, Rol: ${rol}`);

  let ordenes;

  // Construir el fragmento de la condición de estado
  const estadoFilter = estado ? sql`AND p.estado = ${estado}` : sql``;

  // Si es admin (rol === 1), obtener TODAS las ordenes
  if (rol === 1) {
    console.log('👑 Admin detectado - Obteniendo TODAS las órdenes');
    ordenes = await sql`
      SELECT
        p.id_pedido,
        p.id_usuario_cliente,
        p.fecha_pedido,
        p.direccion,
        p.ciudad,
        p.total,
        p.estado,
        p.motivo_anulacion,
        v.id_venta,
        v.metodo_pago,
        CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, '')) as nombre_usuario,
        u.email as email_usuario
      FROM pedidos p
      LEFT JOIN ventas v ON p.id_pedido = v.id_pedido
      LEFT JOIN usuarios u ON p.id_usuario_cliente = u.id_usuario
      WHERE p.estado != 'carrito'
      ${estadoFilter}
      ORDER BY p.id_pedido DESC
    `;
  } else {
    // Usuario normal solo ve sus propias órdenes
    console.log(
      `👤 Usuario normal - Obteniendo órdenes de usuario ${id_usuario}`
    );
    ordenes = await sql`
      SELECT
        p.id_pedido,
        p.id_usuario_cliente,
        p.fecha_pedido,
        p.direccion,
        p.ciudad,
        p.total,
        p.estado,
        p.motivo_anulacion,
        v.id_venta,
        v.metodo_pago,
        CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, '')) as nombre_usuario
      FROM pedidos p
      LEFT JOIN ventas v ON p.id_pedido = v.id_pedido
      LEFT JOIN usuarios u ON p.id_usuario_cliente = u.id_usuario
      WHERE p.id_usuario_cliente = ${id_usuario}
        AND p.estado != 'carrito'
      ORDER BY p.id_pedido ASC
    `;
  }

  console.log(`✅ Encontradas ${ordenes.length} órdenes`);
  return ordenes;
};

/**
 * Obtener detalle de una orden especifica
 * Si es admin, puede ver cualquier orden
 * Si es usuario normal, solo puede ver sus propias ordenes
 */
export const obtenerDetalleOrden = async (
  id_usuario,
  id_pedido,
  rol = null
) => {
  console.log(
    `📝 obtenerDetalleOrden - Usuario: ${id_usuario}, Pedido: ${id_pedido}, Rol: ${rol}`
  );

  let orden;

  // Si es admin, puede ver cualquier orden
  if (rol === 1) {
    console.log('👑 Admin - Buscando orden sin restricción de usuario');
    orden = await sql`
      SELECT 
        p.id_pedido,
        p.id_usuario_cliente,
        p.fecha_pedido,
        p.direccion,
        p.ciudad,
        p.total,
        p.estado,
        p.motivo_anulacion,
        v.id_venta,
        v.metodo_pago,
        CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, '')) as nombre_usuario,
        u.email as email_usuario
      FROM pedidos p
      LEFT JOIN ventas v ON p.id_pedido = v.id_pedido
      LEFT JOIN usuarios u ON p.id_usuario_cliente = u.id_usuario
      WHERE p.id_pedido = ${id_pedido}
    `;
  } else {
    // Usuario normal solo puede ver sus propias órdenes
    console.log('👤 Usuario normal - Verificando que la orden le pertenece');
    orden = await sql`
      SELECT 
        p.id_pedido,
        p.id_usuario_cliente,
        p.fecha_pedido,
        p.direccion,
        p.ciudad,
        p.total,
        p.estado,
        v.id_venta,
        v.metodo_pago
      FROM pedidos p
      LEFT JOIN ventas v ON p.id_pedido = v.id_pedido
      WHERE p.id_pedido = ${id_pedido} 
        AND p.id_usuario_cliente = ${id_usuario}
    `;
  }

  if (orden.length === 0) {
    throw new Error('Orden no encontrada');
  }

  // Obtener items de la orden
  const items = await sql`
    SELECT 
      dp.id_detalle_pedido,
      dp.id_producto,
      dp.cantidad,
      dp.precio_unitario,
      dp.subtotal,
      p.nombre,
      p.sku
    FROM detalle_pedido dp
    INNER JOIN productos p ON dp.id_producto = p.id_producto
    WHERE dp.id_pedido = ${id_pedido}
  `;

  console.log(`✅ Orden encontrada con ${items.length} items`);

  return {
    ...orden[0],
    items,
  };
};

/**
 * Actualizar el estado de un pedido
 */
export const actualizarEstadoPedido = async (id_pedido, estado, motivo = null) => {
  return await sql.begin(async (sql) => {
    // 1. Obtener datos del pedido
    const [pedido] = await sql`SELECT * FROM pedidos WHERE id_pedido = ${id_pedido}`;
    if (!pedido) throw new Error('Pedido no encontrado');

    // 2. Si es cancelación, devolver el stock
    if (estado === 'cancelado') {
      const items = await sql`SELECT id_producto, cantidad FROM detalle_pedido WHERE id_pedido = ${id_pedido}`;
      for (const item of items) {
        await sql`
          UPDATE productos 
          SET stock_actual = stock_actual + ${item.cantidad} 
          WHERE id_producto = ${item.id_producto}
        `;
      }

      // Anular la venta asociada si existe
      await sql`UPDATE ventas SET estado = false WHERE id_pedido = ${id_pedido}`;
    }

    // 3. Si el nuevo estado es 'entregado', crear la venta si no existe
    if (estado === 'entregado') {
      const ventaExistente = await sql`SELECT id_venta FROM ventas WHERE id_pedido = ${id_pedido} AND estado = true`;
      
      if (ventaExistente.length === 0) {
        // Crear la venta
        const [nuevaVenta] = await sql`
          INSERT INTO ventas (
            id_pedido, id_usuario_cliente, id_usuario_empleado, 
            fecha_venta, subtotal, iva, total, metodo_pago, estado
          ) VALUES (
            ${id_pedido}, ${pedido.id_usuario_cliente}, ${pedido.id_usuario_empleado || null}, 
            NOW(), ${pedido.subtotal}, ${pedido.iva}, ${pedido.total}, ${pedido.metodo_pago}, true
          ) RETURNING id_venta
        `;

        // Copiar detalles del pedido a detalles de venta
        const items = await sql`SELECT * FROM detalle_pedido WHERE id_pedido = ${id_pedido}`;
        for (const item of items) {
          await sql`
            INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
            VALUES (${nuevaVenta.id_venta}, ${item.id_producto}, ${item.cantidad}, ${item.precio_unitario}, ${item.subtotal})
          `;
        }
      }
    }

    // 4. Actualizar el estado del pedido
    const [updatedPedido] = await sql`
      UPDATE pedidos 
      SET estado = ${estado},
          motivo_anulacion = ${motivo}
      WHERE id_pedido = ${id_pedido}
      RETURNING *
    `;

    return updatedPedido;
  });
};
