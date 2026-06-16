import { CheckCircle } from "lucide-react";
import { Button } from "../../ui/button";

const V = (name: string) => `var(--luxury-${name})`;
const C = {
  accentDeep: V("pink"),
  shadowSm: V("shadow-sm"),
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
};

interface CheckoutStep3Props {
  generatedOrderId: string;
  finalTotal: number;
  onBack: () => void;
}

export function CheckoutStep3({
  generatedOrderId,
  finalTotal,
  onBack,
}: CheckoutStep3Props) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-success" />
        </div>

        <h1
          className="text-foreground mb-2"
          style={{ fontSize: "32px", fontWeight: 600 }}
        >
          ✅ Pago Verificado
        </h1>

        <p
          className="text-foreground mb-8"
          style={{ fontSize: "18px", fontWeight: 500 }}
        >
          ¡Gracias por tu compra!
        </p>

        <div className="bg-card border border-border rounded-lg p-6 mb-6 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span
              className="text-foreground-secondary"
              style={{ fontSize: "14px" }}
            >
              Pedido:
            </span>
            <span
              className="text-foreground"
              style={{ fontSize: "16px", fontWeight: 600 }}
            >
              #{generatedOrderId}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span
              className="text-foreground-secondary"
              style={{ fontSize: "14px" }}
            >
              Total:
            </span>
            <span
              style={{
                color: C.accentDeep,
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              {formatCurrency(finalTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span
              className="text-foreground-secondary"
              style={{ fontSize: "14px" }}
            >
              Fecha:
            </span>
            <span className="text-foreground" style={{ fontSize: "14px" }}>
              {new Date().toLocaleDateString("es-CO", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-4 mb-6">
          <p
            className="text-foreground-secondary"
            style={{ fontSize: "14px", lineHeight: 1.6 }}
          >
            Tu pedido está siendo procesado. Recibirás una confirmación por email.
          </p>
        </div>

        <Button
          onClick={onBack}
          className="w-full h-12 mb-3 cursor-pointer font-bold"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.background = `linear-gradient(135deg, #f9cce0 0%, #f4a6c4 100%)`;
            e.currentTarget.style.boxShadow = `0 4px 12px ${C.shadowSm}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = `linear-gradient(135deg, #fce8f0 0%, #f9cce0 100%)`;
            e.currentTarget.style.boxShadow = "none";
          }}
          style={{
            background: `linear-gradient(135deg, #fce8f0 0%, #f9cce0 100%)`,
            color: C.accentDeep,
            border: `1px solid #f4a6c4`,
            transition: "all 0.2s ease",
          }}
        >
          🎀 IR AL INICIO
        </Button>

        <p className="text-foreground-secondary" style={{ fontSize: "13px" }}>
          Redirigiendo automáticamente en 8 segundos...
        </p>
      </div>
    </div>
  );
}
