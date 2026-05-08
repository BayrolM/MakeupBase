import React from "react";
import { CheckCircle2, X } from "lucide-react";

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
};

export const getStatusColor = (estado: string) => {
  if (estado === "activo") {
    return {
      bg: "bg-emerald-50/50",
      text: "text-emerald-700",
      label: "Activa",
      icon: React.createElement(CheckCircle2, { className: "w-3.5 h-3.5" }),
    };
  }
  return {
    bg: "bg-[#fff0f5]",
    text: "text-[#c47b96]",
    label: "Anulada",
    icon: React.createElement(X, { className: "w-3.5 h-3.5" }),
  };
};

export const calculateSaleTotals = (productos: any[]) => {
  if (!productos || productos.length === 0) return { subtotal: 0, iva: 0, total: 0 };

  const subtotal = productos.reduce((sum, item) => {
    return sum + (item.precioUnitario * item.cantidad);
  }, 0);

  const total = subtotal;

  return { subtotal, iva: 0, total };
};
