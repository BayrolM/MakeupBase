import { X, Truck, Hash, Calendar, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { GenericCombobox } from "../../forms/GenericCombobox";

interface PedidoShippingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shippingFormData: any;
  setShippingFormData: (data: any) => void;
  isSaving: boolean;
  onConfirm: () => void;
}

export function PedidoShippingDialog({
  open,
  onOpenChange,
  shippingFormData,
  setShippingFormData,
  isSaving,
  onConfirm,
}: PedidoShippingDialogProps) {
  const isGuiaValid = shippingFormData.numero_guia && shippingFormData.numero_guia.trim().length > 0;
  const isEntregaValid = shippingFormData.fecha_estimada && shippingFormData.fecha_estimada.trim().length >= 3;
  const isTransportadoraValid = !!shippingFormData.transportadora;
  const isValid = isGuiaValid && isEntregaValid && isTransportadoraValid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-100 max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center text-white font-bold text-lg flex-shrink-0 luxury-icon-gradient"
              style={{ width: 44, height: 44, borderRadius: 12 }}
            >
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-tight">
                Información de Envío
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400 mt-0.5">
                Registra los datos de la transportadora
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-[#c47b96]" /> Transportadora
            </Label>
            <GenericCombobox
              options={[
                { value: "Servientrega", label: "Servientrega" },
                { value: "Envia", label: "Envía Colvanes" },
                { value: "Coordinadora", label: "Coordinadora" },
                { value: "Interrapidisimo", label: "Interrapidísimo" },
                { value: "Mensajeria Interna", label: "Mensajería Interna" },
              ]}
              value={shippingFormData.transportadora}
              onChange={(v) =>
                setShippingFormData({ ...shippingFormData, transportadora: v })
              }
              placeholder="Seleccionar transportadora"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-[#c47b96]" /> Número de Guía{" "}
              <span className="text-rose-500">*</span>
            </Label>
            <Input
              value={shippingFormData.numero_guia}
              onChange={(e) =>
                setShippingFormData({
                  ...shippingFormData,
                  // Remove letters
                  numero_guia: e.target.value.replace(/[a-zA-Z]/g, ""),
                })
              }
              maxLength={20}
              placeholder="Ej: 1234567890"
              className={`bg-white text-gray-800 rounded-xl focus:ring-[#c47b96]/20 transition-all h-11 ${
                !isGuiaValid ? "!border-rose-400 focus-visible:!ring-rose-400/20" : "border-gray-200 focus:border-[#c47b96]"
              }`}
              style={{ backgroundColor: '#ffffff' }}
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#c47b96]" /> Fecha Envío
              </Label>
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={shippingFormData.fecha_envio}
                onChange={(e) =>
                  setShippingFormData({
                    ...shippingFormData,
                    fecha_envio: e.target.value,
                  })
                }
                className="bg-white border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                style={{ backgroundColor: '#ffffff' }}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#c47b96]" /> Entrega Est.{" "}
                <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="Ej: 3-5 días"
                value={shippingFormData.fecha_estimada}
                onChange={(e) =>
                  setShippingFormData({
                    ...shippingFormData,
                    fecha_estimada: e.target.value,
                  })
                }
                maxLength={20}
                className={`bg-white text-gray-800 rounded-xl focus:ring-[#c47b96]/20 transition-all h-11 ${
                  !isEntregaValid ? "!border-rose-400 focus-visible:!ring-rose-400/20" : "border-gray-200 focus:border-[#c47b96]"
                }`}
                style={{ backgroundColor: '#ffffff' }}
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-5 bg-white border-t border-gray-100">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            style={{
              padding: "10px 22px", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
              cursor: isSaving ? "not-allowed" : "pointer",
              border: "1.5px solid #f0d5e0", background: "#fff8fb", color: "#c47b96",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fdf2f6"; e.currentTarget.style.borderColor = "#c47b96"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff8fb"; e.currentTarget.style.borderColor = "#f0d5e0"; }}
          >
            Cancelar
          </button>
          <Button
            onClick={onConfirm}
            disabled={isSaving || !isValid}
            className={`rounded-lg font-semibold h-10 text-sm shadow-lg transition-all text-white px-4 ${
              !isValid ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ backgroundColor: "#c47b96" }}
          >
            {isSaving ? "Confirmando..." : "Confirmar Envío"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
