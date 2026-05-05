import sql from "../config/db.js";

/**
 * Listar todas las devoluciones con datos de cliente y empleado.
 * Incluye detalles de productos para cada devoluciÃƒÂ³n.
 */
export const listar = async (req, res) => {
  try {
    const { q, estado } = req.query;

    // Base query con JOINs
    let devoluciones;

    if (q || estado) {
      // BÃƒÂºsqueda con filtros
      const searchTerm = q ? `%${q.toLowerCase()}%` : null;
      devoluciones = await sql`
        SELECT d.*,
               uc.nombre AS nombre_cliente, uc.apellido AS apellido_cliente, uc.email AS email_cliente,
               ue.nombre AS nombre_empleado, ue.apellido AS apellido_empleado
        FROM devoluciones d
        LEFT JOIN usuarios uc ON d.id_usuario_cliente = uc.id_usuario
        LEFT JOIN usuarios ue ON d.id_usuario_empleado = ue.id_usuario
        WHERE 1=1
          ${estado ? sql`AND d.estado = ${estado}` : sql``}
          ${searchTerm ? sql`AND (
            LOWER(uc.nombre) LIKE ${searchTerm} OR
            LOWER(uc.apellido) LIKE ${searchTerm} OR
            LOWER(uc.email) LIKE ${searchTerm} OR
            LOWER(d.motivo) LIKE ${searchTerm} OR
            LOWER(d.estado) LIKE ${searchTerm} OR
            CAST(d.id_devolucion AS TEXT) LIKE ${searchTerm} OR
            CAST(d.id_venta AS TEXT) LIKE ${searchTerm}
          )` : sql``}
        ORDER BY d.fecha_devolucion DESC
      `;
    } else {
      devoluciones = await sql`
        SELECT d.*,
               uc.nombre AS nombre_cliente, uc.apellido AS apellido_cliente, uc.email AS email_cliente,
               ue.nombre AS nombre_empleado, ue.apellido AS apellido_empleado
        FROM devoluciones d
        LEFT JOIN usuarios uc ON d.id_usuario_cliente = uc.id_usuario
        LEFT JOIN usuarios ue ON d.id_usuario_empleado = ue.id_usuario
        ORDER BY d.fecha_devolucion DESC
      `;
    }

    // Cargar detalles para cada devoluciÃƒÂ³n
    const devolucionesConDetalles = await Promise.all(
      devoluciones.map(async (dev) => {
        const detalles = await sql`
          SELECT dd.*, p.nombre AS nombre_producto
          FROM detalle_devoluciones dd
          LEFT JOIN productos p ON dd.id_producto = p.id_producto
          WHERE dd.id_devolucion = ${dev.id_devolucion}
        `;
        return { ...dev, detalles };
      })
    );

    return res.json(devolucionesConDetalles);
  } catch (error) {
    console.error("Ã¢ÂÅ’ Error listando devoluciones:", error);
    return res.status(500).json({ ok: false, message: "Error al obtener devoluciones." });
  }
};

/**
 * Obtener una devoluciÃƒÂ³n por ID con todos sus detalles.
 */
export const obtener = async (req, res) => {
  try {
    const { id } = req.params;

    const [devolucion] = await sql`
      SELECT d.*,
             uc.nombre AS nombre_cliente, uc.apellido AS apellido_cliente, uc.email AS email_cliente, uc.telefono AS telefono_cliente,
             ue.nombre AS nombre_empleado, ue.apellido AS apellido_empleado
      FROM devoluciones d
      LEFT JOIN usuarios uc ON d.id_usuario_cliente = uc.id_usuario
      LEFT JOIN usuarios ue ON d.id_usuario_empleado = ue.id_usuario
      WHERE d.id_devolucion = ${id}
    `;

    if (!devolucion) {
      return res.status(404).json({ ok: false, message: "DevoluciÃƒÂ³n no encontrada." });
    }

    const detalles = await sql`
      SELECT dd.*, p.nombre AS nombre_producto
      FROM detalle_devoluciones dd
      LEFT JOIN productos p ON dd.id_producto = p.id_producto
      WHERE dd.id_devolucion = ${id}
    `;

    return res.json({ ...devolucion, detalles });
  } catch (error) {
    console.error("Ã¢ÂÅ’ Error obteniendo devoluciÃƒÂ³n:", error);
    return res.status(500).json({ ok: false, message: "Error al obtener la devoluciÃƒÂ³n." });
  }
};

/**
 * Crear una nueva devoluciÃƒÂ³n.
 * TransacciÃƒÂ³n: inserta devoluciÃƒÂ³n + detalles + actualiza stock si estado es "aprobada".
 */
export const crear = async (req, res) => {
  try {
    const { id_venta, id_usuario_cliente, motivo, estado, productos, fecha_devolucion, evidencia_url, es_defectuoso } = req.body;
    const id_usuario_empleado = req.user.id_usuario;


    // Validaciones
    if (!id_venta) {
      return res.status(400).json({ ok: false, message: "Debe ingresar el ID de la venta." });
    }
    if (!motivo || motivo.trim().length < 5) {
      return res.status(400).json({ ok: false, message: "El motivo debe tener al menos 5 caracteres." });
    }
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ ok: false, message: "Debe seleccionar al menos un producto." });
    }

    const estadoFinal = estado || "pendiente";
    const estadosValidos = ["pendiente", "aprobada", "rechazada"];
    if (!estadosValidos.includes(estadoFinal)) {
      return res.status(400).json({ ok: false, message: "Estado no vÃƒÂ¡lido." });
    }

    const resultado = await sql.begin(async (sql) => {
      // 1. Verificar que la venta existe y estÃƒÂ¡ activa
      const [venta] = await sql`
        SELECT * FROM ventas WHERE id_venta = ${id_venta}
      `;
      if (!venta) {
        throw new Error("La venta no existe.");
      }
      if (venta.estado === false || venta.estado === 0) {
        throw new Error("La venta estÃƒÂ¡ anulada y no permite devoluciones.");
      }

      // 2. Verificar que no haya devoluciones previas de los mismos productos
      const devolucionesExistentes = await sql`
        SELECT dd.id_producto FROM detalle_devoluciones dd
        INNER JOIN devoluciones d ON dd.id_devolucion = d.id_devolucion
        WHERE d.id_venta = ${id_venta} AND d.estado != 'anulada'
      `;
      const productosYaDevueltos = devolucionesExistentes.map(d => d.id_producto);

      for (const prod of productos) {
        if (productosYaDevueltos.includes(prod.id_producto)) {
          const [prodInfo] = await sql`SELECT nombre FROM productos WHERE id_producto = ${prod.id_producto}`;
          throw new Error(`El producto "${prodInfo?.nombre || prod.id_producto}" ya tiene una devoluciÃƒÂ³n registrada para esta venta.`);
        }
      }

      // 3. Verificar cantidades contra detalle de la venta original
      for (const prod of productos) {
        const [detalleVenta] = await sql`
          SELECT cantidad FROM detalle_ventas
          WHERE id_venta = ${id_venta} AND id_producto = ${prod.id_producto}
        `;
        if (!detalleVenta) {
          throw new Error(`El producto ID ${prod.id_producto} no pertenece a esta venta.`);
        }
        if (prod.cantidad > detalleVenta.cantidad) {
          throw new Error(`La cantidad a devolver (${prod.cantidad}) excede la cantidad vendida (${detalleVenta.cantidad}).`);
        }
        if (prod.cantidad <= 0) {
          throw new Error("La cantidad a devolver debe ser mayor a 0.");
        }
      }

      // 4. Calcular total devuelto
      let totalDevuelto = 0;
      for (const prod of productos) {
        totalDevuelto += prod.cantidad * prod.precio_unitario;
      }

      // 5. Insertar la devoluciÃƒÂ³n
      const [devolucion] = await sql`
        INSERT INTO devoluciones (id_usuario_cliente, id_usuario_empleado, id_venta, fecha_devolucion, motivo, total_devuelto, estado, evidencia_url, es_defectuoso)
        VALUES (
          ${id_usuario_cliente},
          ${id_usuario_empleado},
          ${id_venta},
          ${fecha_devolucion || new Date()},
          ${motivo.trim()},
          ${totalDevuelto},
          ${estadoFinal},
          ${evidencia_url || null},
          ${es_defectuoso || false}
        )

        RETURNING *
      `;

      // 6. Insertar detalles
      for (const prod of productos) {
        const subtotal = prod.cantidad * prod.precio_unitario;
        await sql`
          INSERT INTO detalle_devoluciones (id_devolucion, id_producto, cantidad, precio_unitario, subtotal)
          VALUES (${devolucion.id_devolucion}, ${prod.id_producto}, ${prod.cantidad}, ${prod.precio_unitario}, ${subtotal})
        `;
      }

      // 7. Si estado es "aprobada", manejar stock o pÃƒÂ©rdida
      if (estadoFinal === "aprobada") {
        if (es_defectuoso) {
          // Si es defectuoso, registrar como pÃƒÂ©rdida
          await registrarPerdidaPorDevolucion(sql, devolucion.id_devolucion, id_usuario_empleado, productos);
        } else {
          // Si no es defectuoso, sumar stock
          for (const prod of productos) {
            await sql`
              UPDATE productos
              SET stock_actual = stock_actual + ${prod.cantidad}
              WHERE id_producto = ${prod.id_producto}
            `;
          }
        }
      }

      return devolucion;
    });

    return res.status(201).json(resultado);
  } catch (error) {
    console.error("Ã¢ÂÅ’ Error creando devoluciÃƒÂ³n:", error);
    const knownErrors = [
      "La venta no existe",
      "La venta estÃƒÂ¡ anulada",
      "ya tiene una devoluciÃƒÂ³n",
      "no pertenece a esta venta",
      "excede la cantidad",
      "mayor a 0",
    ];
    const isKnown = knownErrors.some((msg) => error.message?.includes(msg));
    return res
      .status(isKnown ? 400 : 500)
      .json({ ok: false, message: error.message || "Error al registrar la devoluciÃƒÂ³n." });
  }
};

/**
 * Cambiar estado de una devoluciÃƒÂ³n (pendiente/en_revision Ã¢â€ â€™ aprobada/rechazada/en_revision).
 * Si se aprueba, suma stock.
 */
export const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, motivo_decision, es_defectuoso } = req.body;
    const id_usuario_empleado = req.user.id_usuario;

    if (!estado) {
      return res.status(400).json({ ok: false, message: "Debe especificar el nuevo estado." });
    }
    if (!motivo_decision || motivo_decision.trim().length < 3) {
      return res.status(400).json({ ok: false, message: "Debe ingresar un motivo para el cambio de estado (mÃƒÂ­nimo 3 caracteres)." });
    }

    const estadosPermitidos = ["en_revision", "aprobada", "rechazada"];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ ok: false, message: "Estado no vÃƒÂ¡lido. Use: en_revision, aprobada o rechazada." });
    }

    await sql.begin(async (sql) => {
      const [devolucion] = await sql`
        SELECT * FROM devoluciones WHERE id_devolucion = ${id}
      `;

      if (!devolucion) {
        throw new Error("La devoluciÃƒÂ³n no existe.");
      }

      // Solo se puede cambiar estado si estÃƒÂ¡ pendiente o en_revision
      if (!["pendiente", "en_revision"].includes(devolucion.estado)) {
        throw new Error(`No se puede cambiar el estado de una devoluciÃƒÂ³n "${devolucion.estado}".`);
      }

      // Actualizar estado y flag de defectuoso
      await sql`
        UPDATE devoluciones
        SET estado = ${estado}, 
            motivo_decision = ${motivo_decision.trim()},
            es_defectuoso = ${es_defectuoso || false}
        WHERE id_devolucion = ${id}
      `;

      // Si se aprueba, manejar stock o pÃƒÂ©rdida
      if (estado === "aprobada") {
        const detalles = await sql`
          SELECT id_producto, cantidad FROM detalle_devoluciones WHERE id_devolucion = ${id}
        `;
        
        if (es_defectuoso) {
          // Registrar como pÃƒÂ©rdida
          await registrarPerdidaPorDevolucion(sql, id, id_usuario_empleado, detalles);
        } else {
          // Sumar stock
          for (const det of detalles) {
            await sql`
              UPDATE productos
              SET stock_actual = stock_actual + ${det.cantidad}
              WHERE id_producto = ${det.id_producto}
            `;
          }
        }
      }
    });

    return res.json({ ok: true, message: "Estado actualizado correctamente." });
  } catch (error) {
    console.error("Ã¢ÂÅ’ Error cambiando estado:", error);
    const isKnown = error.message?.includes("no existe") || error.message?.includes("No se puede");
    return res
      .status(isKnown ? 400 : 500)
      .json({ ok: false, message: error.message || "Error al cambiar el estado." });
  }
};

/**
 * Anular una devoluciÃƒÂ³n.
 * Si estaba aprobada, revierte el stock. Las anuladas se conservan en historial.
 */
export const anular = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo_anulacion } = req.body;

    if (!motivo_anulacion || motivo_anulacion.trim().length < 5) {
      return res.status(400).json({ ok: false, message: "Debe ingresar un motivo de anulaciÃƒÂ³n (mÃƒÂ­nimo 5 caracteres)." });
    }

    await sql.begin(async (sql) => {
      const [devolucion] = await sql`
        SELECT * FROM devoluciones WHERE id_devolucion = ${id}
      `;

      if (!devolucion) {
        throw new Error("La devoluciÃƒÂ³n no existe.");
      }

      if (devolucion.estado === "anulada") {
        throw new Error("La devoluciÃƒÂ³n ya se encuentra anulada.");
      }

      // Si la devolución estaba aprobada, revertir el stock si NO era defectuoso
      if (devolucion.estado === "aprobada") {
        if (!devolucion.es_defectuoso) {
          const detalles = await sql`
            SELECT id_producto, cantidad FROM detalle_devoluciones WHERE id_devolucion = ${id}
          `;
          for (const det of detalles) {
            await sql`
              UPDATE productos
              SET stock_actual = stock_actual - ${det.cantidad}
              WHERE id_producto = ${det.id_producto}
            `;
          }
        } else {
          // Si era defectuosa, eliminar el registro de pérdidas asociado
          const detallesPerdida = await sql`
            SELECT DISTINCT id_perdida FROM detalle_perdidas WHERE id_devolucion = ${id}
          `;
          if (detallesPerdida.length > 0) {
            const idsPerdida = detallesPerdida.map(p => p.id_perdida);
            await sql`
              DELETE FROM detalle_perdidas WHERE id_devolucion = ${id}
            `;
            await sql`
              DELETE FROM perdidas WHERE id_perdida IN (${idsPerdida})
            `;
          }
        }
      }

      // Cambiar estado a anulada
      await sql`
        UPDATE devoluciones
        SET estado = 'anulada',
            motivo_anulacion = ${motivo_anulacion.trim()},
            fecha_anulacion = NOW()
        WHERE id_devolucion = ${id}
      `;
    });

    return res.json({ ok: true, message: "DevoluciÃ³n anulada correctamente." });
  } catch (error) {
    console.error("âŒ Error anulando devoluciÃ³n:", error);
    const isKnown = error.message?.includes("no existe") || error.message?.includes("ya se encuentra");
    return res
      .status(isKnown ? 400 : 500)
      .json({ ok: false, message: error.message || "Error al anular la devolución." });
  }
};

/**
 * Función auxiliar para registrar una pérdida a partir de una devolución defectuosa.
 */
async function registrarPerdidaPorDevolucion(sql, id_devolucion, id_usuario, productos) {
  let totalPerdida = 0;
  const detallesConCosto = [];

  for (const prod of productos) {
    const [infoProd] = await sql`
      SELECT costo_promedio FROM productos WHERE id_producto = ${prod.id_producto}
    `;
    const costo = Number(infoProd?.costo_promedio || 0);
    const subtotal = costo * prod.cantidad;
    totalPerdida += subtotal;
    detallesConCosto.push({
      id_producto: prod.id_producto,
      cantidad: prod.cantidad,
      costo_unitario: costo,
      subtotal: subtotal
    });
  }

  // Insertar cabecera de perdida
  const motivoPerdida = 'otro';
  const observacionPerdida = 'Perdida generada automaticamente por devolucion defectuosa #' + id_devolucion + '.';

  const [perdida] = await sql`
    INSERT INTO perdidas (id_usuario_empleado, motivo, observacion, total_perdida)
    VALUES (
      ${id_usuario},
      ${motivoPerdida},
      ${observacionPerdida},
      ${totalPerdida}
    )
    RETURNING id_perdida
  `;

  // Insertar detalles de perdida
  for (const det of detallesConCosto) {
    await sql`
      INSERT INTO detalle_perdidas (id_perdida, id_producto, cantidad, costo_unitario, subtotal, id_devolucion)
      VALUES (
        ${perdida.id_perdida},
        ${det.id_producto},
        ${det.cantidad},
        ${det.costo_unitario},
        ${det.subtotal},
        ${id_devolucion}
      )
    `;
  }
}
