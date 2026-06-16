import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Constantes de estilo basadas en la paleta de Makeup Base
const BRAND_COLOR = "FF7B1347";
const TEXT_WHITE = "FFFFFFFF";
const TEXT_DARK = "FF1E1B1D";
const BG_LIGHT = "FFFDF9FB";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
};

// Configura encabezados premium para las tablas
const styleHeaderRow = (sheet: ExcelJS.Worksheet, rowNumber: number) => {
  const row = sheet.getRow(rowNumber);
  row.height = 25;
  row.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: BRAND_COLOR },
    };
    cell.font = {
      color: { argb: TEXT_WHITE },
      bold: true,
      size: 11,
      name: "Arial",
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    cell.border = {
      top: { style: "thin", color: { argb: BRAND_COLOR } },
      bottom: { style: "thin", color: { argb: BRAND_COLOR } },
      left: { style: "thin", color: { argb: BRAND_COLOR } },
      right: { style: "thin", color: { argb: BRAND_COLOR } },
    };
  });
};

const autoFitColumns = (sheet: ExcelJS.Worksheet) => {
  sheet.columns.forEach((column) => {
    let maxLength = 0;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    // Agregamos un poco de padding
    column.width = maxLength < 15 ? 15 : maxLength + 5;
  });
};

export const exportDashboardToExcel = async (data: any, dateRange?: any) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Makeup Base Admin";
  workbook.lastModifiedBy = "Makeup Base Admin";
  workbook.created = new Date();
  workbook.modified = new Date();

  // ----- HOJA 1: RESUMEN GENERAL -----
  const wsResumen = workbook.addWorksheet("Resumen Ejecutivo", {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: BRAND_COLOR } }
  });

  // Título principal
  wsResumen.mergeCells("A1:C2");
  const titleCell = wsResumen.getCell("A1");
  titleCell.value = "REPORTE DE DASHBOARD - MAKEUP BASE";
  titleCell.font = { name: "Arial", size: 16, bold: true, color: { argb: BRAND_COLOR } };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };

  // Información de fechas
  wsResumen.mergeCells("A3:C3");
  const dateCell = wsResumen.getCell("A3");
  const fromStr = dateRange?.from ? dateRange.from.toLocaleDateString() : "";
  const toStr = dateRange?.to ? dateRange.to.toLocaleDateString() : "";
  dateCell.value = (fromStr || toStr) ? `Período: ${fromStr} a ${toStr}` : "Período: Histórico completo";
  dateCell.font = { name: "Arial", size: 11, italic: true, color: { argb: "FF666666" } };
  dateCell.alignment = { vertical: "middle", horizontal: "center" };

  // Espacio
  wsResumen.addRow([]);

  // Datos del Resumen
  const resumenRowStart = 5;
  wsResumen.getRow(resumenRowStart).values = ["Métrica", "Valor"];
  styleHeaderRow(wsResumen, resumenRowStart);

  const metricas = [
    ["Ingresos Totales", data.resumen.total_ventas, "currency"],
    ["Pérdidas Totales", data.resumen.total_perdidas, "currency"],
    ["Pedidos Realizados", data.resumen.total_ordenes, "number"],
    ["Devoluciones Pendientes", data.resumen.devoluciones_pendientes, "number"],
    ["Total Productos Activos", data.resumen.total_productos, "number"],
    ["Productos con Bajo Stock", data.resumen.productos_bajo_stock, "number"],
  ];

  metricas.forEach((m, index) => {
    const row = wsResumen.addRow([m[0], m[1]]);
    row.height = 20;
    
    // Estilos de la celda de nombre
    const nameCell = row.getCell(1);
    nameCell.font = { bold: true, color: { argb: TEXT_DARK } };
    nameCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    
    // Estilos de la celda de valor
    const valueCell = row.getCell(2);
    valueCell.alignment = { vertical: "middle", horizontal: "right", indent: 1 };
    if (m[2] === "currency") {
      valueCell.numFmt = '"$"#,##0.00';
    } else {
      valueCell.numFmt = '#,##0';
    }

    // Bordes para toda la fila
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
      };
      // Fondo sutil alterno
      if (index % 2 !== 0) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BG_LIGHT } };
      }
    });
  });

  // Ajustar anchos
  wsResumen.getColumn(1).width = 35;
  wsResumen.getColumn(2).width = 25;


  // ----- HOJA 2: PRODUCTOS MÁS VENDIDOS -----
  if (data.productos_mas_vendidos?.length > 0) {
    const wsTop = workbook.addWorksheet("Top Vendidos");
    wsTop.addRow(["ID", "Nombre del Producto", "Unidades Vendidas"]);
    styleHeaderRow(wsTop, 1);

    data.productos_mas_vendidos.forEach((p: any) => {
      wsTop.addRow([p.id_producto, p.nombre, p.total_vendido]);
    });
    autoFitColumns(wsTop);
  }

  // ----- HOJA 3: VENTAS DIARIAS -----
  if (data.ventas_del_mes?.length > 0) {
    const wsVentas = workbook.addWorksheet("Ventas Diarias");
    wsVentas.addRow(["Fecha/Día", "Total de Ingresos"]);
    styleHeaderRow(wsVentas, 1);

    data.ventas_del_mes.forEach((v: any) => {
      const row = wsVentas.addRow([v.dia, parseFloat(v.total) || 0]);
      row.getCell(2).numFmt = '"$"#,##0.00';
    });
    autoFitColumns(wsVentas);
  }

  // ----- HOJA 4: STOCK CRÍTICO -----
  if (data.productos_stock_critico?.length > 0) {
    const wsStock = workbook.addWorksheet("Stock Crítico", { properties: { tabColor: { argb: "FFD32F2F" } } });
    wsStock.addRow(["ID", "Producto", "Categoría", "Marca", "Stock Actual", "Mínimo Permitido", "Precio Venta"]);
    styleHeaderRow(wsStock, 1);

    data.productos_stock_critico.forEach((p: any) => {
      const row = wsStock.addRow([
        p.id_producto, 
        p.nombre, 
        p.categoria || "N/A", 
        p.marca || "N/A", 
        p.stock_actual, 
        p.stock_min, 
        p.precio_venta
      ]);
      row.getCell(5).font = { bold: true, color: { argb: "FFD32F2F" } }; // Destacar stock actual en rojo
      row.getCell(7).numFmt = '"$"#,##0.00'; // Formato moneda para precio
    });
    autoFitColumns(wsStock);
  }

  // ----- HOJA 5: PEDIDOS POR ESTADO -----
  if (data.pedidos_por_estado?.length > 0) {
    const wsPedidos = workbook.addWorksheet("Pedidos por Estado");
    wsPedidos.addRow(["Estado del Pedido", "Cantidad"]);
    styleHeaderRow(wsPedidos, 1);

    data.pedidos_por_estado.forEach((p: any) => {
      const row = wsPedidos.addRow([p.estado, parseInt(p.cantidad) || 0]);
      row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
    });
    autoFitColumns(wsPedidos);
  }

  // ----- HOJA 6: TENDENCIA MENSUAL -----
  if (data.ventas_tendencia?.length > 0) {
    const wsTendencia = workbook.addWorksheet("Tendencia Mensual");
    wsTendencia.addRow(["Mes", "Cantidad de Ventas", "Total de Ingresos"]);
    styleHeaderRow(wsTendencia, 1);

    data.ventas_tendencia.forEach((v: any) => {
      const row = wsTendencia.addRow([v.mes_nombre, parseInt(v.cantidad) || 0, parseFloat(v.total) || 0]);
      row.getCell(3).numFmt = '"$"#,##0.00';
    });
    autoFitColumns(wsTendencia);
  }

  // Escribir archivo y disparar descarga
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const fileName = `Dashboard_MakeupBase_${new Date().toISOString().split("T")[0]}.xlsx`;
  saveAs(blob, fileName);
};
