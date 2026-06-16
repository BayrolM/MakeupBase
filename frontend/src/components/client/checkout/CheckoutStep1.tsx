import React from 'react';
import { ArrowLeft, Banknote, Smartphone, Loader2 } from 'lucide-react';
import { mainCities, colombianDepartments } from '../../../hooks/useCheckoutLogic';

const V = (name: string) => `var(--luxury-${name})`;
const C = {
  bgSoft: V('bg-soft'),
  accent: V('pink-soft'),
  accentDeep: V('pink'),
  textDark: V('text-dark'),
  textMuted: V('text-muted'),
  shadowSm: V('shadow-sm'),
  shadow: V('shadow'),
  white: '#ffffff',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
};

export function CheckoutStep1({
  carrito,
  productos,
  total,
  subtotal,
  onBack,
  direccionEnvio,
  setDireccionEnvio,
  ciudadEnvio,
  setCiudadEnvio,
  departamentoEnvio,
  setDepartamentoEnvio,
  handleContinuarPago,
  stockValidated
}: any) {
  const inputStyle = {
    width: '100%',
    height: '44px',
    borderRadius: '10px',
    border: `1.5px solid ${C.accent}`,
    padding: '0 16px',
    fontSize: '14px',
    color: C.textDark,
    outline: 'none',
    background: C.white,
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-10"
      style={{
        height: "100vh",
        background: C.bgSoft,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: C.accentDeep,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Volver al carrito
        </button>
        <div>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: C.accentDeep,
              margin: 0,
              textAlign: "right",
            }}
          >
            Paso 1 de 2
          </p>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: C.textDark,
              margin: 0,
            }}
          >
            Finalizar Compra
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 flex-1 overflow-y-auto overflow-x-hidden md:overflow-hidden pb-20 md:pb-0">
        {/* ─ ORDER SUMMARY ─ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: C.accentDeep,
              marginBottom: "12px",
            }}
          >
            Resumen del Pedido
          </p>
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.accent}`,
              borderRadius: "12px",
              padding: "20px",
              boxShadow: `0 2px 8px ${C.shadow}`,
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {carrito.map((item) => {
                const producto = productos.find(
                  (p) => p.id === item.productoId,
                );
                if (!producto) return null;
                return (
                  <div
                    key={item.productoId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: `1px solid ${C.accent}`,
                          flexShrink: 0,
                          background: C.bgSoft,
                        }}
                      >
                        {producto.imagenUrl ? (
                          <img
                            src={producto.imagenUrl}
                            alt={producto.nombre}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: "10px",
                              color: C.accentDeep,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "100%",
                            }}
                          >
                            Imagen
                          </span>
                        )}
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: C.textDark,
                            margin: 0,
                          }}
                        >
                          {producto.nombre}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: C.textMuted,
                            margin: 0,
                          }}
                        >
                          Cant. {item.cantidad}
                        </p>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: C.textDark,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatCurrency(producto.precioVenta * item.cantidad)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                borderTop: `1px solid ${C.accent}`,
                marginTop: "16px",
                paddingTop: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  color: C.textMuted,
                }}
              >
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: C.textDark,
                  borderTop: `1px solid ${C.accent}`,
                  paddingTop: "12px",
                  marginTop: "4px",
                }}
              >
                <span>Total</span>
                <span style={{ color: C.accentDeep }}>
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─ SHIPPING + PAYMENT ─ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            overflowY: "auto",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: C.accentDeep,
              marginBottom: "0",
            }}
          >
            Información de Envío
          </p>

          {/* Address */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: C.textMuted,
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Departamento *
              </label>
              <input
                value={departamentoEnvio}
                onChange={(e) => {
                  setDepartamentoEnvio(e.target.value);
                  setCiudadEnvio("");
                }}
                list="deptos-list"
                style={inputStyle}
                placeholder="Escribe o selecciona..."
              />
              <datalist id="deptos-list">
                {colombianDepartments.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: C.textMuted,
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Ciudad *
              </label>
              <input
                value={ciudadEnvio}
                onChange={(e) => setCiudadEnvio(e.target.value)}
                list={`ciudades-${departamentoEnvio}`}
                style={inputStyle}
                placeholder="Escribe o selecciona..."
              />
              <datalist id={`ciudades-${departamentoEnvio}`}>
                {(mainCities[departamentoEnvio] || []).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>
          <div>
            <label
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: C.textMuted,
                display: "block",
                marginBottom: "8px",
              }}
            >
              Dirección *
            </label>
            <input
              value={direccionEnvio}
              onChange={(e) => setDireccionEnvio(e.target.value)}
              style={inputStyle}
              placeholder="Calle 31C #89-35"
            />
          </div>

          {/* Payment methods */}
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.accent}`,
              borderRadius: "12px",
              padding: "20px",
              boxShadow: `0 2px 8px ${C.shadow}`,
            }}
          >
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: C.accentDeep,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "14px",
              }}
            >
              Método de Pago
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  background: "#fffbf0",
                  border: "1px solid #fde68a",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#fff8e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Banknote
                    style={{ width: 18, height: 18, color: "#d97706" }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: C.textDark,
                      margin: 0,
                    }}
                  >
                    Bancolombia
                  </p>
                  <p
                    style={{ fontSize: "11px", color: C.textMuted, margin: 0 }}
                  >
                    Cuenta de Ahorros · 123-456789-12
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  background: "#fdf4ff",
                  border: "1px solid #e9d5ff",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "#f5f0ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Smartphone
                    style={{ width: 18, height: 18, color: "#7c3aed" }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: C.textDark,
                      margin: 0,
                    }}
                  >
                    Nequi
                  </p>
                  <p
                    style={{ fontSize: "11px", color: C.textMuted, margin: 0 }}
                  >
                    321 525 7246 · Glamour ML
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* CTA */}
          <button
            onClick={handleContinuarPago}
            disabled={!direccionEnvio || !ciudadEnvio || !departamentoEnvio || !stockValidated}
            onMouseEnter={(e) => {
              if (direccionEnvio && ciudadEnvio && departamentoEnvio && stockValidated) {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.background = `linear-gradient(135deg, #f9cce0 0%, #f4a6c4 100%)`;
                e.currentTarget.style.boxShadow = `0 4px 12px ${C.shadowSm}`;
              }
            }}
            onMouseLeave={(e) => {
              if (direccionEnvio && ciudadEnvio && departamentoEnvio && stockValidated) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.background = `linear-gradient(135deg, #fce8f0 0%, #f9cce0 100%)`;
                e.currentTarget.style.boxShadow = "none";
              }
            }}
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "10px",
              background: direccionEnvio && ciudadEnvio && departamentoEnvio && stockValidated
                ? `linear-gradient(135deg, #fce8f0 0%, #f9cce0 100%)`
                : "#e5e7eb",
              color: direccionEnvio && ciudadEnvio && departamentoEnvio && stockValidated ? C.accentDeep : C.textMuted,
              border: direccionEnvio && ciudadEnvio && departamentoEnvio && stockValidated ? `1px solid #f4a6c4` : "none",
              cursor: direccionEnvio && ciudadEnvio && departamentoEnvio && stockValidated ? "pointer" : "not-allowed",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              transition: "all 0.2s ease",
            }}
          >
            {!stockValidated ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Validando inventario...
              </div>
            ) : (
              "🎀 Ver datos de pago y transferir"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
