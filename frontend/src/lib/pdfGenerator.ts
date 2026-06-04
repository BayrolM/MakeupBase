import jsPDF from "jspdf";
import { toast } from "sonner";
import { Cliente, Producto } from "./store";

interface VentaData {
  id: string;
  fecha: string;
  metodoPago: string;
  clienteId: string;
  subtotal: number;
  total: number;
  productos: {
    productoId: string;
    cantidad: number;
    precioUnitario: number;
  }[];
}

// ─────────────────────────────────────────────
// HELPERS COMPARTIDOS
// ─────────────────────────────────────────────

const COLORS = {
  primary:   [46,  16,  32]  as [number, number, number],   // #2e1020
  secondary: [224, 146, 178] as [number, number, number],   // #e092b2
  accent:    [196, 123, 150] as [number, number, number],   // #c47b96
  border:    [225, 210, 218] as [number, number, number],
  text:      [40,  40,  40]  as [number, number, number],
  textLight: [130, 100, 115] as [number, number, number],
  rowAlt:    [252, 246, 249] as [number, number, number],
  headerBg:  [250, 242, 246] as [number, number, number],
  white:     [255, 255, 255] as [number, number, number],
};

const formatCOP = (v: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(isNaN(v) ? 0 : v);

async function loadLogo(doc: any): Promise<void> {
  try {
    const img = new Image();
    img.src = "/logo.png";
    await new Promise((resolve) => {
      img.onload  = () => { doc.addImage(img, "PNG", 14, 10, 22, 22); resolve(true); };
      img.onerror = () => resolve(false);
    });
  } catch (_) {}
}

/**
 * Dibuja la cabecera con fondo sólido primary y datos de empresa a la derecha.
 * Retorna la Y donde termina el bloque de cabecera.
 */
async function drawHeader(
  doc: any,
  title: string,
  ref: string,
): Promise<number> {
  const H = 38;

  // Fondo cabecera
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, H, "F");

  // Franja accent inferior
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, H, 210, 1.5, "F");

  await loadLogo(doc);

  // Nombre empresa
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.white);
  doc.text("GLAMOUR ML", 42, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(224, 146, 178);
  doc.text("TIENDA DE BELLEZA & CUIDADO PERSONAL", 42, 24);

  // Separador vertical
  doc.setDrawColor(255, 255, 255, 0.3);
  doc.setLineWidth(0.3);
  doc.line(42, 28, 160, 28);

  // Ciudad / contacto (opcional, siempre fijo)
  doc.setFontSize(7);
  doc.setTextColor(200, 170, 185);
  doc.text("Medellín, Colombia", 42, 33);

  // Título documento (derecha)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.white);
  doc.text(title, 196, 17, { align: "right" });

  // Ref / número
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.secondary);
  doc.text(ref, 196, 25, { align: "right" });

  return H + 1.5; // Y donde termina
}

/**
 * Dibuja un bloque de info de dos columnas (cliente/proveedor + detalles).
 * Retorna la Y al final del bloque.
 */
function drawInfoBlock(
  doc: any,
  startY: number,
  left: { label: string; rows: string[] },
  right: { label: string; rows: string[] },
): number {
  const blockH = Math.max(left.rows.length, right.rows.length) * 6 + 18;

  // Fondo bloque info
  doc.setFillColor(...COLORS.headerBg);
  doc.rect(14, startY, 182, blockH, "F");

  // Borde izquierdo accent
  doc.setFillColor(...COLORS.accent);
  doc.rect(14, startY, 2.5, blockH, "F");

  // Labels superiores
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.accent);
  doc.text(left.label,  22,  startY + 8);
  doc.text(right.label, 115, startY + 8);

  // Separador
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(22, startY + 10, 196, startY + 10);

  // Texto izquierda
  let ly = startY + 16;
  left.rows.forEach((row, i) => {
    if (i === 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.textLight);
    }
    doc.text(row, 22, ly);
    ly += i === 0 ? 7 : 5.5;
  });

  // Texto derecha
  let ry = startY + 16;
  right.rows.forEach((row, i) => {
    if (i === 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.textLight);
    }
    doc.text(row, 115, ry);
    ry += i === 0 ? 7 : 5.5;
  });

  return startY + blockH + 6;
}

/**
 * Dibuja el encabezado de la tabla de productos.
 * Retorna la Y después del header.
 */
function drawTableHeader(doc: any, y: number, cols: { label: string; x: number; align?: string }[]): number {
  doc.setFillColor(...COLORS.primary);
  doc.rect(14, y, 182, 9, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);

  cols.forEach(({ label, x, align }) => {
    doc.text(label, x, y + 6, { align: align || "left" });
  });

  return y + 9;
}

/**
 * Dibuja una fila de la tabla.
 * Retorna la Y después de la fila.
 */
function drawTableRow(
  doc: any,
  y: number,
  idx: number,
  cells: { text: string; x: number; bold?: boolean; align?: string }[],
  nameLines: string[],
): number {
  const rowH = nameLines.length * 5 + 7;

  // Fondo alternado
  if (idx % 2 !== 0) {
    doc.setFillColor(...COLORS.rowAlt);
    doc.rect(14, y, 182, rowH, "F");
  }

  // Línea separadora inferior
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.15);
  doc.line(14, y + rowH, 196, y + rowH);

  cells.forEach(({ text, x, bold, align }) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    doc.text(text, x, y + 6, { align: align || "left" });
  });

  return y + rowH;
}

/**
 * Dibuja el bloque de totales.
 */
function drawTotalsBlock(
  doc: any,
  y: number,
  lines: { label: string; value: string; large?: boolean }[],
) {
  const blockW = 80;
  const blockX = 196 - blockW;
  let curY = y;

  // Fondo totales
  doc.setFillColor(...COLORS.headerBg);
  doc.rect(blockX - 4, curY - 4, blockW + 4, lines.length * 9 + 8, "F");

  // Borde superior accent
  doc.setFillColor(...COLORS.accent);
  doc.rect(blockX - 4, curY - 4, blockW + 4, 1.5, "F");

  lines.forEach(({ label, value, large }) => {
    if (large) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.primary);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.textLight);
    }
    doc.text(label, blockX, curY + (large ? 7 : 5.5));
    doc.text(value, 196, curY + (large ? 7 : 5.5), { align: "right" });
    curY += large ? 10 : 8;
  });
}

/**
 * Dibuja el footer del documento.
 */
function drawFooter(doc: any, note: string) {
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(14, 268, 196, 268);

  doc.setFillColor(...COLORS.primary);
  doc.rect(14, 271, 4, 8, "F");

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.textLight);
  doc.text(note, 22, 275);
  doc.text("GLAMOUR ML  ·  Medellín, Colombia", 22, 281);
}


// ─────────────────────────────────────────────
// FACTURA DE VENTA
// ─────────────────────────────────────────────

export const generateSalePDF = async (
  venta: VentaData,
  cliente: Cliente | undefined,
  productosDestino: Producto[],
) => {
  try {
    const doc = new jsPDF() as any;

    const headerEnd = await drawHeader(
      doc,
      "FACTURA DE VENTA",
      `# ${venta.id.slice(0, 8).toUpperCase()}`,
    );

    const infoEnd = drawInfoBlock(
      doc,
      headerEnd + 6,
      {
        label: "CLIENTE",
        rows: [
          cliente?.nombre || "Consumidor Final",
          `Doc: ${cliente?.documento || cliente?.numeroDocumento || "N/A"}`,
        ],
      },
      {
        label: "INFORMACIÓN",
        rows: [
          `Fecha: ${venta.fecha}`,
          `Email: ${cliente?.email || "N/A"}`,
          `Tel: ${cliente?.telefono || "N/A"}`,
          `Método de pago: ${venta.metodoPago || "N/A"}`,
        ],
      },
    );

    // Etiqueta sección
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.accent);
    doc.text("DETALLE DE PRODUCTOS", 14, infoEnd + 4);

    let tableY = drawTableHeader(doc, infoEnd + 6, [
      { label: "PRODUCTO / DESCRIPCIÓN", x: 19 },
      { label: "CANT",                  x: 118, align: "center" },
      { label: "PRECIO UNIT.",          x: 152, align: "center" },
      { label: "TOTAL",                 x: 195, align: "right"  },
    ]);

    (venta.productos || []).forEach((p: any, i: number) => {
      const prod     = productosDestino.find((pr: Producto) => pr.id === p.productoId);
      const lines    = doc.splitTextToSize(prod?.nombre || "Producto", 88);
      const total    = (p.cantidad || 0) * (p.precioUnitario || 0);

      tableY = drawTableRow(doc, tableY, i, [
        { text: lines[0],                    x: 19  },
        { text: String(p.cantidad || 0),     x: 118, align: "center" },
        { text: formatCOP(p.precioUnitario), x: 152, align: "center" },
        { text: formatCOP(total),            x: 195, align: "right", bold: true },
      ], lines);

      // Líneas extra si el nombre es largo
      if (lines.length > 1) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...COLORS.textLight);
        doc.text(lines.slice(1).join(" "), 19, tableY - (lines.length - 1) * 5 + 1);
      }
    });

    const footerY = Math.max(tableY + 14, 195);
    drawTotalsBlock(doc, footerY, [
      { label: "TOTAL", value: formatCOP(venta.total), large: true },
    ]);

    drawFooter(doc, "Gracias por su compra. Este comprobante no representa una factura fiscal legal.");

    doc.save(`GlamourML_Factura_${venta.id.slice(0, 8)}.pdf`);
    toast.success("Factura generada correctamente");
  } catch (error) {
    console.error("Error generando PDF:", error);
    toast.error("Ocurrió un error al intentar generar el PDF");
  }
};


// ─────────────────────────────────────────────
// COMPROBANTE DE PEDIDO / ORDEN
// ─────────────────────────────────────────────

export const generateOrderPDF = async (
  orderData: any,
  cliente: Cliente | undefined,
  productosDestino: Producto[],
  CONFIG: any,
) => {
  try {
    const doc = new jsPDF() as any;

    const months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const d = new Date(orderData.fecha);
    const fechaTxt = isNaN(d.getDate())
      ? orderData.fecha
      : `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

    const headerEnd = await drawHeader(
      doc,
      "COMPROBANTE DE PEDIDO",
      `# ${orderData.id.slice(0, 8).toUpperCase()}`,
    );

    const infoEnd = drawInfoBlock(
      doc,
      headerEnd + 6,
      {
        label: "CLIENTE",
        rows: [
          orderData.clienteNombre || cliente?.nombre || "N/A",
          orderData.direccionEnvio || orderData.direccion || "Sin dirección",
          (orderData.ciudad || orderData.departamento) ? `${orderData.ciudad || ''} ${orderData.departamento ? '- ' + orderData.departamento : ''}`.trim() : ""
        ].filter(Boolean) as string[],
      },
      {
        label: "DATOS DEL PEDIDO",
        rows: [
          `Fecha: ${fechaTxt}`,
          `Email: ${orderData.email || cliente?.email || "N/A"}`,
          `Tel: ${orderData.telefono || cliente?.telefono || "N/A"}`,
        ].filter(Boolean) as string[],
      },
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.accent);
    doc.text("DETALLE DE PRODUCTOS", 14, infoEnd + 4);

    let tableY = drawTableHeader(doc, infoEnd + 6, [
      { label: "PRODUCTO / DESCRIPCIÓN", x: 19 },
      { label: "CANT",                  x: 118, align: "center" },
      { label: "PRECIO UNIT.",          x: 152, align: "center" },
      { label: "TOTAL",                 x: 195, align: "right"  },
    ]);

    (orderData.productos || []).forEach((p: any, i: number) => {
      const prod    = productosDestino.find((pr) => pr.id === p.productoId);
      const precio  = p.precio_unit_ov || p.precio_unitario || p.precioUnitario || 0;
      const lines   = doc.splitTextToSize(prod?.nombre || "Producto", 88);
      const total   = p.cantidad * precio;

      tableY = drawTableRow(doc, tableY, i, [
        { text: lines[0],              x: 19  },
        { text: String(p.cantidad),    x: 118, align: "center" },
        { text: formatCOP(precio),     x: 152, align: "center" },
        { text: formatCOP(total),      x: 195, align: "right", bold: true },
      ], lines);
    });

    const envio    = CONFIG.COSTO_ENVIO || 0;
    const subtotal = orderData.total - envio;
    const footerY  = Math.max(tableY + 14, 195);

    drawTotalsBlock(doc, footerY, [
      { label: "Subtotal", value: formatCOP(subtotal) },
      { label: "Envío",    value: formatCOP(envio)    },
      { label: "TOTAL",    value: formatCOP(orderData.total), large: true },
    ]);

    drawFooter(doc, "Gracias por su compra. Este comprobante no representa una factura fiscal legal.");

    doc.save(`GlamourML_Pedido_${orderData.id.slice(0, 5)}.pdf`);
    toast.success("Comprobante generado correctamente");
  } catch (error: any) {
    console.error(error);
    toast.error("Error al generar el documento PDF");
  }
};


// ─────────────────────────────────────────────
// COMPROBANTE DE DEVOLUCIÓN
// ─────────────────────────────────────────────

export const generateDevolucionPDF = async (
  devolucion: any,
  cliente: Cliente | undefined,
  productosDestino: Producto[],
) => {
  try {
    const doc = new jsPDF() as any;

    const estadoLabels: Record<string, string> = {
      pendiente:  "PENDIENTE",
      en_revision:"EN REVISIÓN",
      aprobada:   "APROBADA",
      rechazada:  "RECHAZADA",
      anulada:    "ANULADA",
    };
    const estadoLabel = estadoLabels[devolucion.estado] || devolucion.estado?.toUpperCase();

    const estadoColor: [number, number, number] =
      devolucion.estado === "aprobada"
        ? [16, 185, 129]
        : devolucion.estado === "rechazada" || devolucion.estado === "anulada"
        ? [220, 60, 60]
        : [200, 150, 10];

    // ── Cabecera con badge de estado ──
    const H = 38;
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, 210, H, "F");
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, H, 210, 1.5, "F");

    await loadLogo(doc);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...COLORS.white);
    doc.text("GLAMOUR ML", 42, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(224, 146, 178);
    doc.text("TIENDA DE BELLEZA & CUIDADO PERSONAL", 42, 24);
    doc.setFontSize(7);
    doc.setTextColor(200, 170, 185);
    doc.text("Medellín, Colombia", 42, 33);

    // Título + ref
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.white);
    doc.text("COMPROBANTE DE DEVOLUCIÓN", 196, 17, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.secondary);
    doc.text(`DEV-${devolucion.id}`, 196, 25, { align: "right" });

    // Badge estado (pastilla)
    const badgeW  = doc.getTextWidth(estadoLabel) + 10;
    const badgeX  = 196 - badgeW;
    doc.setFillColor(...estadoColor);
    doc.roundedRect(badgeX, 29, badgeW, 6, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(estadoLabel, 196 - badgeW / 2, 33.2, { align: "center" });

    const headerEnd = H + 1.5;

    const infoEnd = drawInfoBlock(
      doc,
      headerEnd + 6,
      {
        label: "CLIENTE",
        rows: [
          devolucion.clienteNombre || cliente?.nombre || "Consumidor Final",
          `Doc: ${cliente?.documento || cliente?.numeroDocumento || "N/A"}`,
        ],
      },
      {
        label: "DATOS DE DEVOLUCIÓN",
        rows: [
          `Fecha: ${devolucion.fecha}`,
          devolucion.ventaId     ? `Venta ref: #${devolucion.ventaId}` : "",
          devolucion.empleadoNombre ? `Procesada por: ${devolucion.empleadoNombre}` : "",
        ].filter(Boolean),
      },
    );

    // ── Bloque de motivo ──
    const motivoLines = doc.splitTextToSize(devolucion.motivo || "Sin motivo", 166);
    const motivoH     = motivoLines.length * 5 + 14;

    doc.setFillColor(252, 244, 248);
    doc.roundedRect(14, infoEnd, 182, motivoH, 2, 2, "F");
    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.8);
    doc.line(14, infoEnd, 14, infoEnd + motivoH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.accent);
    doc.text("MOTIVO DE DEVOLUCIÓN", 20, infoEnd + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.text);
    doc.text(motivoLines, 20, infoEnd + 13);

    const afterMotivo = infoEnd + motivoH + 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.accent);
    doc.text("DETALLE DE PRODUCTOS", 14, afterMotivo + 2);

    let tableY = drawTableHeader(doc, afterMotivo + 4, [
      { label: "PRODUCTO",      x: 19 },
      { label: "CANT",          x: 113, align: "center" },
      { label: "PRECIO UNIT.",  x: 152, align: "center" },
      { label: "SUBTOTAL",      x: 195, align: "right"  },
    ]);

    (devolucion.productos || []).forEach((p: any, i: number) => {
      const prod     = productosDestino.find((pr: Producto) => pr.id === p.productoId);
      const nombre   = p.productoNombre || prod?.nombre || "Producto";
      const lines    = doc.splitTextToSize(nombre, 88);
      const subtotal = p.subtotal || (p.cantidad || 0) * (p.precioUnitario || 0);

      tableY = drawTableRow(doc, tableY, i, [
        { text: lines[0],                  x: 19  },
        { text: String(p.cantidad || 0),   x: 113, align: "center" },
        { text: formatCOP(p.precioUnitario || 0), x: 152, align: "center" },
        { text: formatCOP(subtotal),       x: 195, align: "right", bold: true },
      ], lines);
    });

    const footerY = Math.max(tableY + 14, 210);
    drawTotalsBlock(doc, footerY, [
      { label: "TOTAL DEVUELTO", value: formatCOP(devolucion.totalDevuelto || 0), large: true },
    ]);

    // Marca de agua ANULADA
    if (devolucion.estado === "anulada") {
      doc.setFontSize(48);
      doc.setTextColor(220, 60, 60);
      doc.setFont("helvetica", "bold");
      doc.text("ANULADA", 105, 170, { align: "center", angle: 30 });
    }

    drawFooter(doc, "Este comprobante certifica la devolución registrada en el sistema.");

    doc.save(`GlamourML_Devolucion_DEV-${devolucion.id}.pdf`);
    toast.success("Comprobante de devolución generado correctamente");
  } catch (error) {
    console.error("Error generando PDF de devolución:", error);
    toast.error("Ocurrió un error al intentar generar el PDF");
  }
};


// ─────────────────────────────────────────────
// COMPROBANTE DE COMPRA (PROVEEDOR)
// ─────────────────────────────────────────────

export const generateCompraPDF = async (
  compra: any,
  proveedor: any,
  productosDestino: Producto[],
) => {
  try {
    const doc = new jsPDF() as any;

    const headerEnd = await drawHeader(
      doc,
      "COMPROBANTE DE COMPRA",
      `# ${compra.id.slice(0, 8).toUpperCase()}`,
    );

    const confirmada = compra.confirmada || compra.estado;
    const infoEnd = drawInfoBlock(
      doc,
      headerEnd + 6,
      {
        label: "PROVEEDOR",
        rows: [
          proveedor?.nombre || "Proveedor Desconocido",
          `NIT: ${proveedor?.documento || proveedor?.numeroDocumento || "N/A"}`,
          `Tel: ${proveedor?.telefono || "N/A"}`,
        ],
      },
      {
        label: "DETALLES DE LA ORDEN",
        rows: [
          `Fecha: ${new Date(compra.fecha).toLocaleDateString("es-CO")}`,
          `Estado: ${confirmada ? "Confirmada" : "Anulada"}`,
        ],
      },
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.accent);
    doc.text("DETALLE DE PRODUCTOS", 14, infoEnd + 4);

    let tableY = drawTableHeader(doc, infoEnd + 6, [
      { label: "PRODUCTO / DESCRIPCIÓN", x: 19 },
      { label: "CANT",                  x: 118, align: "center" },
      { label: "PRECIO UNIT.",          x: 152, align: "center" },
      { label: "TOTAL",                 x: 195, align: "right"  },
    ]);

    (compra.detalles || []).forEach((d: any, i: number) => {
      const pName = d.nombre_producto
        || productosDestino.find((p) => p.id === d.id_producto?.toString())?.nombre
        || `Item #${d.id_producto}`;
      const lines = doc.splitTextToSize(pName, 88);
      const total = (d.cantidad || 0) * (d.precio_unitario || 0);

      tableY = drawTableRow(doc, tableY, i, [
        { text: lines[0],                   x: 19  },
        { text: String(d.cantidad || 0),    x: 118, align: "center" },
        { text: formatCOP(d.precio_unitario || 0), x: 152, align: "center" },
        { text: formatCOP(total),           x: 195, align: "right", bold: true },
      ], lines);
    });

    const footerY = Math.max(tableY + 14, 195);
    drawTotalsBlock(doc, footerY, [
      { label: "TOTAL COMPRA", value: formatCOP(compra.total), large: true },
    ]);

    drawFooter(doc, "Este documento es un comprobante interno de recibo de mercancía.");

    doc.save(`GlamourML_Compra_${compra.id.slice(0, 8)}.pdf`);
    toast.success("Comprobante de compra generado");
  } catch (error) {
    console.error("Error generando PDF:", error);
    toast.error("Ocurrió un error al intentar generar el PDF");
  }
};