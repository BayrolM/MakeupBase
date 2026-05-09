import sql from "../config/db.js";

export const getNotificationSummary = async (req, res) => {
  try {
    // 1. Pedidos pendientes (character varying)
    const pendingOrders = await sql`
      SELECT COUNT(*) as total 
      FROM pedidos 
      WHERE estado = 'pendiente'
    `;

    // 2. Productos con stock bajo (boolean estado)
    const lowStockProducts = await sql`
      SELECT COUNT(*) as total 
      FROM productos 
      WHERE stock_actual <= stock_min AND estado = true
    `;

    // 3. Devoluciones pendientes (character varying)
    const pendingReturns = await sql`
      SELECT COUNT(*) as total 
      FROM devoluciones 
      WHERE estado IN ('pendiente', 'en_revision')
    `;

    const totalPedidos = parseInt(pendingOrders[0].total, 10) || 0;
    const totalStock = parseInt(lowStockProducts[0].total, 10) || 0;
    const totalDevoluciones = parseInt(pendingReturns[0].total, 10) || 0;

    return res.json({
      ok: true,
      summary: {
        pedidos: totalPedidos,
        stock: totalStock,
        devoluciones: totalDevoluciones,
        total: totalPedidos + totalStock + totalDevoluciones
      }
    });
  } catch (error) {
    console.error("Error en getNotificationSummary:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener resumen de notificaciones",
      error: error.message
    });
  }
};
