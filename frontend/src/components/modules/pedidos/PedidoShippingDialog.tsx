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
                  numero_guia: e.target.value,
                })
              }
              placeholder="Ej: 1234567890"
              className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
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
                value={shippingFormData.fecha_envio}
                onChange={(e) =>
                  setShippingFormData({
                    ...shippingFormData,
                    fecha_envio: e.target.value,
                  })
                }
                className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#c47b96]" /> Entrega Est.
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
                className="bg-gray-50 border-gray-200 text-gray-800 rounded-xl focus:ring-[#c47b96]/20 focus:border-[#c47b96] transition-all h-11"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-5 bg-white border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg px-4 h-10 text-sm"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSaving}
            className="rounded-lg font-semibold h-10 text-sm shadow-lg transition-all text-white px-4"
            style={{ backgroundColor: "#c47b96" }}
          >
            {isSaving ? "Confirmando..." : "Confirmar Envío"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
