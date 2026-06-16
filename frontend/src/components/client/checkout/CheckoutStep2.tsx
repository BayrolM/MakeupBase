import React from 'react';
import { ArrowLeft, Banknote, Smartphone, Upload, X, HelpCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../ui/dialog';
import { toast } from 'sonner';

const V = (name: string) => `var(--luxury-${name})`;
const C = {
  bgSoft: V('bg-soft'),
  accent: V('pink-soft'),
  accentDark: V('accent-dark'),
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

export function CheckoutStep2({
  total,
  onBack,
  comprobanteFile,
  setComprobanteFile,
  isUploading,
  showConfirmDialog,
  setShowConfirmDialog,
  isProcessing,
  handleConfirmPayment
}: any) {
  return (
      <>
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
          {/* Top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "28px",
            }}
          >
            <button
              onClick={() => setStep(1)}
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
              Volver al resumen
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
                Paso 2 de 2
              </p>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: C.textDark,
                  margin: 0,
                }}
              >
                Realiza tu transferencia
              </h2>
            </div>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 flex-1 w-full overflow-y-auto overflow-x-hidden md:overflow-hidden pb-20 md:pb-0">
            {/* LEFT: Bank accounts */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                height: "100%",
              }}
            >
              {/* Bancolombia */}
              <div
                style={{
                  background: C.white,
                  border: `1px solid ${C.accent}`,
                  borderRadius: "14px",
                  padding: "20px",
                  boxShadow: `0 2px 8px ${C.shadow}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#fff8e1",
                      border: "1px solid #fde68a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Banknote
                      style={{ width: 20, height: 20, color: "#d97706" }}
                    />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: C.textDark,
                        margin: 0,
                      }}
                    >
                      Bancolombia
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: C.textMuted,
                        margin: 0,
                      }}
                    >
                      Cuenta de Ahorros
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      background: C.bgSoft,
                      border: `1px solid ${C.accent}`,
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        color: C.accentDeep,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "4px",
                      }}
                    >
                      N° de Cuenta
                    </p>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: C.textDark,
                        fontFamily: "monospace",
                        margin: 0,
                      }}
                    >
                      123-456789-12
                    </p>
                  </div>
                  <div
                    style={{
                      background: C.bgSoft,
                      border: `1px solid ${C.accent}`,
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        color: C.accentDeep,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "4px",
                      }}
                    >
                      Tipo
                    </p>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: C.textDark,
                        margin: 0,
                      }}
                    >
                      Ahorros
                    </p>
                  </div>
                </div>
              </div>

              {/* Nequi */}
              <div
                style={{
                  background: C.white,
                  border: `1px solid ${C.accent}`,
                  borderRadius: "14px",
                  padding: "20px",
                  boxShadow: `0 2px 8px ${C.shadow}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#f5f0ff",
                      border: "1px solid #e9d5ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Smartphone
                      style={{ width: 20, height: 20, color: "#7c3aed" }}
                    />
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: C.textDark,
                        margin: 0,
                      }}
                    >
                      Nequi
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        color: C.textMuted,
                        margin: 0,
                      }}
                    >
                      Transferencia por celular
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      background: C.bgSoft,
                      border: `1px solid ${C.accent}`,
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        color: C.accentDeep,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "4px",
                      }}
                    >
                      Número Nequi
                    </p>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: C.textDark,
                        fontFamily: "monospace",
                        margin: 0,
                      }}
                    >
                      321 525 7246
                    </p>
                  </div>
                  <div
                    style={{
                      background: C.bgSoft,
                      border: `1px solid ${C.accent}`,
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        color: C.accentDeep,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "4px",
                      }}
                    >
                      Nombre
                    </p>
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: C.textDark,
                        margin: 0,
                      }}
                    >
                      Glamour ML
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Total + Comprobante + CTA */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                height: "100%",
              }}
            >
              {/* Total banner */}
              <div
                style={{
                  background: `linear-gradient(135deg, #fce8f0 0%, #f9cce0 100%)`,
                  borderRadius: "14px",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: `1px solid #f4a6c4`,
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: C.textDark,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      margin: 0,
                      opacity: 0.8,
                    }}
                  >
                    Total a transferir
                  </p>
                  <p
                    style={{
                      fontSize: "28px",
                      fontWeight: 800,
                      color: C.accentDeep,
                      letterSpacing: "-1px",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {formatCurrency(total)}
                  </p>
                </div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Banknote style={{ width: 22, height: 22, color: C.accentDeep }} />
                </div>
              </div>

              {/* Comprobante upload */}
              {(() => {
                const handleFileChange = (
                  e: React.ChangeEvent<HTMLInputElement>,
                ) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    // Validar tipo de archivo (solo imágenes)
                    if (!file.type.startsWith("image/")) {
                      toast.error("Archivo no válido", {
                        description:
                          "Por favor selecciona una imagen (PNG, JPG, etc.)",
                      });
                      e.target.value = ""; // Limpiar input
                      setComprobanteFile(null);
                      return;
                    }
                    // Validar tamaño (ejemplo: 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("Archivo demasiado grande", {
                        description: "El tamaño máximo es de 5MB",
                      });
                      e.target.value = "";
                      setComprobanteFile(null);
                      return;
                    }
                  }
                  setComprobanteFile(file);
                };

                return (
                  <div
                    style={{
                      background: C.white,
                      border: `2px dashed ${comprobanteFile ? "#16a34a" : C.accentDark}`,
                      borderRadius: "14px",
                      padding: "20px",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                      position: "relative",
                    }}
                  >
                    <input
                      type="file"
                      id="comprobante-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="comprobante-upload"
                      style={{
                        width: "100%",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          background: comprobanteFile
                            ? "rgba(22, 163, 74, 0.1)"
                            : C.bgSoft,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {comprobanteFile ? (
                          <CheckCircle
                            style={{ width: 28, height: 28, color: "#16a34a" }}
                          />
                        ) : (
                          <Upload
                            style={{
                              width: 28,
                              height: 28,
                              color: C.accentDeep,
                            }}
                          />
                        )}
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: C.textDark,
                            margin: 0,
                          }}
                        >
                          {comprobanteFile
                            ? "¡Comprobante listo!"
                            : "Subir comprobante"}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: C.textMuted,
                            margin: "4px 0 0 0",
                          }}
                        >
                          {comprobanteFile
                            ? comprobanteFile.name
                            : "PNG, JPG o JPEG (Máx. 5MB)"}
                        </p>
                      </div>
                    </label>

                    {comprobanteFile && (
                      <button
                        onClick={() => setComprobanteFile(null)}
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "none",
                          border: "none",
                          color: C.textMuted,
                          cursor: "pointer",
                          padding: "4px",
                        }}
                      >
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* CTA */}
              <button
                onClick={() => setShowConfirmDialog(true)}
                disabled={!comprobanteFile || isUploading}
                onMouseEnter={(e) => {
                  if (comprobanteFile && !isUploading) {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.background = `linear-gradient(135deg, #f9cce0 0%, #f4a6c4 100%)`;
                    e.currentTarget.style.boxShadow = `0 4px 12px ${C.shadowSm}`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (comprobanteFile && !isUploading) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = `linear-gradient(135deg, #fce8f0 0%, #f9cce0 100%)`;
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
                style={{
                  width: "100%",
                  height: "52px",
                  borderRadius: "12px",
                  background:
                    comprobanteFile && !isUploading
                      ? `linear-gradient(135deg, #fce8f0 0%, #f9cce0 100%)`
                      : "#e5e7eb",
                  color:
                    comprobanteFile && !isUploading ? C.accentDeep : C.textMuted,
                  border:
                    comprobanteFile && !isUploading ? `1px solid #f4a6c4` : "none",
                  cursor:
                    comprobanteFile && !isUploading ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  transition: "all 0.2s ease",
                }}
              >
                {isUploading ? "Procesando..." : "✅ Ya realicé el pago"}
              </button>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  color: C.textMuted,
                  marginTop: "-8px",
                }}
              >
                Solo presiona después de completar la transferencia.
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent
            className="bg-white border-0 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden"
            aria-describedby="confirm-payment-desc"
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, #fce8f0 0%, #f9cce0 100%)`,
                    border: `1px solid #f4a6c4`,
                    boxShadow: "0 2px 8px rgba(196,123,150,0.3)",
                  }}
                >
                  <Banknote className="w-5 h-5" style={{ color: C.accentDeep }} />
                </div>
                <div>
                  <DialogTitle
                    className="text-base font-bold leading-tight"
                    style={{ color: C.textDark }}
                  >
                    Confirmar pedido
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-400 mt-0.5">
                    Verificación de pago por transferencia
                  </DialogDescription>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              <div
                style={{
                  background: C.bgSoft,
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  border: `1px solid ${C.accent}`,
                }}
              >
                <HelpCircle
                  style={{
                    color: C.accentDeep,
                    width: 18,
                    height: 18,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      color: C.textDark,
                      lineHeight: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    ¿Has completado todos los pasos?
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: C.textMuted,
                      marginTop: 4,
                      lineHeight: 1.5,
                    }}
                  >
                    Confirma solo si ya realizaste la transferencia desde tu
                    banco y has adjuntado el comprobante correctamente.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isProcessing}
                style={{
                  background: "#ffffff",
                  color: "#4b5563",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "0 24px",
                  height: "40px",
                  fontSize: "14px",
                  fontWeight: 600,
                  minWidth: "110px",
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="rounded-lg font-semibold px-6 h-10 text-sm"
                onMouseEnter={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.background = `linear-gradient(135deg, #f9cce0 0%, #f4a6c4 100%)`;
                    e.currentTarget.style.boxShadow = `0 4px 12px ${C.shadowSm}`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = `linear-gradient(135deg, #fce8f0 0%, #f9cce0 100%)`;
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
                style={{
                  background: `linear-gradient(135deg, #fce8f0 0%, #f9cce0 100%)`,
                  color: C.accentDeep,
                  border: `1px solid #f4a6c4`,
                  transition: "all 0.2s ease",
                }}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando pedido...
                  </div>
                ) : (
                  <div className="flex items-center gap-2 cursor-pointer">
                    <CheckCircle className="w-4 h-4" />
                    Sí, confirmar
                  </div>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>

  );
}
