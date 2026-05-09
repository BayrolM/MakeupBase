import {
  X,
  Calendar,
  FileText,
  Package,
  CheckCircle2,
  XCircle,
  User as UserIcon,
  Briefcase,
  MessageSquare,
  AlertCircle,
  AlertTriangle,
  Download,
  ShieldAlert,
  Hash,
  TrendingDown,
  ShoppingBag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { formatCurrency } from "../../../utils/devolucionUtils";
import { generateDevolucionPDF } from "../../../lib/pdfGenerator";

interface DevolucionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devolucion: any;
  clientes: any[];
  productos: any[];
}

export function DevolucionDetailDialog({
  open,
  onOpenChange,
  devolucion,
  clientes,
  productos,
}: DevolucionDetailDialogProps) {
  if (!devolucion) return null;

  const cliente = clientes.find((c) => c.id === devolucion.clienteId);
  const itemCount = (devolucion.productos || []).length;

  const esDefectuoso = devolucion.esDefectuoso === true;

  const estadoConfig: Record<
    string,
    {
      bg: string;
      text: string;
      border: string;
      icon: React.ReactNode;
      label: string;
    }
  > = {
    aprobada: {
      bg: "#dcfce7",
      text: "#15803d",
      border: "#bbf7d0",
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: "Aprobada",
    },
    rechazada: {
      bg: "#fee2e2",
      text: "#b91c1c",
      border: "#fecaca",
      icon: <XCircle className="w-3 h-3" />,
      label: "Rechazada",
    },
    anulada: {
      bg: "#f3f4f6",
      text: "#374151",
      border: "#e5e7eb",
      icon: <XCircle className="w-3 h-3" />,
      label: "Anulada",
    },
    pendiente: {
      bg: "#fef3c7",
      text: "#92400e",
      border: "#fde68a",
      icon: null,
      label: "Pendiente",
    },
    en_revision: {
      bg: "#dbeafe",
      text: "#1e40af",
      border: "#bfdbfe",
      icon: null,
      label: "En Revisión",
    },
  };
  const badge = estadoConfig[devolucion.estado] ?? {
    bg: "#f3f4f6",
    text: "#374151",
    border: "#e5e7eb",
    icon: null,
    label: devolucion.estado,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: "#9ca3af",

    letterSpacing: "0.07em",
    marginBottom: 5,
    display: "flex",
    alignItems: "center",
    gap: 5,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 !w-[95vw] !max-w-[820px] rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "22px 24px 20px",
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg,#c47b96,#e092b2)",
                boxShadow: "0 2px 8px rgba(196,123,150,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.3,
                }}
              >
                Detalle de Devolución
              </DialogTitle>
              <DialogDescription
                style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}
              >
                DEV-{devolucion.id}
                {devolucion.ventaId ? ` · Venta #${devolucion.ventaId}` : ""}
              </DialogDescription>
            </div>
          </div>

          {/* Estado badge + close */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.05em",

                background: badge.bg,
                color: badge.text,
                border: `1px solid ${badge.border}`,
              }}
            >
              {badge.icon}
              {badge.label}
            </span>
            {esDefectuoso && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.05em",

                  background: "#fff7ed",
                  color: "#c2410c",
                  border: "1px solid #fed7aa",
                }}
              >
                <ShieldAlert className="w-3 h-3" /> Defectuoso
              </span>
            )}
            <button
              onClick={() => onOpenChange(false)}
              style={{
                padding: 6,
                borderRadius: "50%",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#9ca3af",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f3f4f6")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`,
          }}
        />

        {/* ── Body ── */}
        <div
          className="no-scrollbar overflow-y-auto"
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxHeight: "68vh",
          }}
        >
          {/* Banner defectuoso */}
          {esDefectuoso && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 12,
                background: "#fff7ed",
                border: "1px solid #fed7aa",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#ffedd5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldAlert className="w-4 h-4" style={{ color: "#c2410c" }} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#c2410c",

                    letterSpacing: "0.07em",
                    margin: 0,
                  }}
                >
                  Producto Defectuoso
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "#9a3412",
                    margin: "2px 0 0",
                    fontWeight: 500,
                  }}
                >
                  Este producto fue marcado como defectuoso.{" "}
                  <strong>No se reintegró al stock</strong> — se registró como
                  pérdida automáticamente.
                </p>
              </div>
            </div>
          )}

          {/* Banner auditoría */}
          {(devolucion.motivoDecision || devolucion.motivoAnulacion) && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "12px 16px",
                borderRadius: 12,
                background: "#fefce8",
                border: "1px solid #fde047",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle
                  className="w-4 h-4"
                  style={{ color: "#ca8a04", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#854d0e",

                    letterSpacing: "0.07em",
                  }}
                >
                  Seguimiento de Auditoría
                </span>
              </div>
              {devolucion.motivoDecision && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#713f12",
                    margin: "0 0 0 24px",
                    fontWeight: 500,
                  }}
                >
                  <strong>Decisión:</strong>{" "}
                  <em>"{devolucion.motivoDecision}"</em>
                </p>
              )}
              {devolucion.motivoAnulacion && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#991b1b",
                    margin: "0 0 0 24px",
                    fontWeight: 500,
                  }}
                >
                  <strong>Anulación:</strong>{" "}
                  <em>"{devolucion.motivoAnulacion}"</em>
                  {devolucion.fechaAnulacion && (
                    <span style={{ color: "#9ca3af", marginLeft: 8 }}>
                      ({devolucion.fechaAnulacion})
                    </span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Fila de información: 3 cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
            }}
          >
            {/* Cliente */}
            <div
              style={{
                background: "#f9fafb",
                borderRadius: 12,
                padding: "14px 16px",
                border: "1px solid #f3f4f6",
              }}
            >
              <p style={labelStyle}>
                <UserIcon className="w-3.5 h-3.5" /> Cliente
              </p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#111827",
                  margin: 0,
                }}
              >
                {devolucion.clienteNombre || cliente?.nombre || "N/A"}
              </p>
              {devolucion.emailCliente && (
                <p
                  style={{
                    fontSize: 11,
                    color: "#9ca3af",
                    margin: "3px 0 0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {devolucion.emailCliente}
                </p>
              )}
            </div>

            {/* Empleado + Fecha */}
            <div
              style={{
                background: "#f9fafb",
                borderRadius: 12,
                padding: "14px 16px",
                border: "1px solid #f3f4f6",
              }}
            >
              <p style={labelStyle}>
                <Briefcase className="w-3.5 h-3.5" /> Procesada por
              </p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#111827",
                  margin: 0,
                }}
              >
                {devolucion.empleadoNombre || "N/A"}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  margin: "3px 0 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Calendar className="w-3 h-3" /> {devolucion.fecha}
              </p>
            </div>

            {/* Condición */}
            <div
              style={{
                borderRadius: 12,
                padding: "14px 16px",
                background: esDefectuoso ? "#fff7ed" : "#f0fdf4",
                border: `1px solid ${esDefectuoso ? "#fed7aa" : "#bbf7d0"}`,
              }}
            >
              <p
                style={{
                  ...labelStyle,
                  color: esDefectuoso ? "#c2410c" : "#15803d",
                }}
              >
                {esDefectuoso ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Condición
              </p>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  margin: 0,
                  color: esDefectuoso ? "#c2410c" : "#15803d",
                }}
              >
                {esDefectuoso ? "Defectuoso" : "Buen estado"}
              </p>
              <p
                style={{
                  fontSize: 11,
                  margin: "3px 0 0",
                  color: esDefectuoso ? "#9a3412" : "#166534",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {esDefectuoso ? (
                  <>
                    <TrendingDown className="w-3 h-3" /> Registrado como pérdida
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3 h-3" /> Regresó al inventario
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Motivo */}
          <div
            style={{
              background: "#f9fafb",
              borderRadius: 12,
              padding: "14px 16px",
              border: "1px solid #f3f4f6",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg,#c47b96,#e092b2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <p style={labelStyle}>Motivo de Devolución</p>
              <p
                style={{
                  fontSize: 13,
                  color: "#374151",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                "{devolucion.motivo}"
              </p>
            </div>
          </div>

          {/* Lista de productos */}
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #f3f4f6",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Header lista */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f9fafb",
                padding: "10px 16px",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <p style={{ ...labelStyle, margin: 0 }}>
                <Package className="w-3.5 h-3.5" /> Productos Devueltos
              </p>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#c47b96",
                  background: "#fff0f5",
                  padding: "2px 10px",
                  borderRadius: 12,
                  border: "1px solid #fce8f0",
                }}
              >
                {itemCount} {itemCount === 1 ? "ÍTEM" : "ÍTEMS"}
              </span>
            </div>

            {/* Col headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 90px 90px",
                gap: 8,
                padding: "8px 16px",
                background: "#f9fafb",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              {["Producto", "Cant.", "P. Unit.", "Subtotal"].map((h, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9ca3af",

                    letterSpacing: "0.07em",
                    margin: 0,
                    textAlign: i === 0 ? "left" : "right",
                  }}
                >
                  {h}
                </p>
              ))}
            </div>

            {/* Rows */}
            <div>
              {(devolucion.productos || []).length === 0 ? (
                <div
                  style={{
                    padding: "32px 0",
                    textAlign: "center",
                    color: "#d1d5db",
                    fontSize: 13,
                    fontStyle: "italic",
                  }}
                >
                  No hay productos registrados
                </div>
              ) : (
                (devolucion.productos || []).map((item: any, i: number) => {
                  const prod = productos.find((p) => p.id === item.productoId);
                  const subtotal =
                    item.subtotal || item.cantidad * (item.precioUnitario || 0);
                  const isLast = i === (devolucion.productos || []).length - 1;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 80px 90px 90px",
                        gap: 8,
                        padding: "14px 16px",
                        alignItems: "center",
                        borderBottom: isLast ? "none" : "1px solid #f9fafb",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fdf8fa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Nombre */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: "#f3f4f6",
                            border: "1px solid #e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            overflow: "hidden",
                          }}
                        >
                          {prod?.imagenUrl ? (
                            <img
                              src={prod.imagenUrl}
                              alt={prod.nombre}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <Package
                              className="w-4 h-4"
                              style={{ color: "#d1d5db" }}
                            />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "#111827",
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.productoNombre ||
                              prod?.nombre ||
                              "Desconocido"}
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "#9ca3af",
                              margin: "2px 0 0",
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <Hash className="w-2.5 h-2.5" />
                            {item.productoId}
                          </p>
                        </div>
                      </div>

                      {/* Cant */}
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            background: "#f3f4f6",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#374151",
                          }}
                        >
                          {item.cantidad}
                        </span>
                      </div>

                      {/* P. Unit */}
                      <p
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                          margin: 0,
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        {formatCurrency(item.precioUnitario || 0)}
                      </p>

                      {/* Subtotal */}
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 900,
                          color: "#111827",
                          margin: 0,
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(subtotal)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Total footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderTop: "1px solid #f3f4f6",
                background: "#fff0f5",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9ca3af",

                  letterSpacing: "0.07em",
                }}
              >
                Total Reembolso
              </span>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#c47b96",
                  letterSpacing: "-0.5px",
                }}
              >
                {formatCurrency(devolucion.totalDevuelto)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 24px",
            borderTop: "1px solid #f3f4f6",
            background: "#fff",
          }}
        >
          <button
            onClick={() =>
              generateDevolucionPDF(devolucion, cliente, productos)
            }
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: "1.5px solid #f0d5e0",
              background: "#fff8fb",
              color: "#c47b96",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fdf2f6";
              e.currentTarget.style.borderColor = "#c47b96";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff8fb";
              e.currentTarget.style.borderColor = "#f0d5e0";
            }}
          >
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
          <button
            onClick={() => onOpenChange(false)}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              background: "linear-gradient(135deg, #c47b96 0%, #a85d77 100%)",
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(196,123,150,0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 16px rgba(196,123,150,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(196,123,150,0.3)";
            }}
          >
            Cerrar Detalle
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
