import { Venta, Pedido } from "../lib/store";

export const validateClientField = (
  name: string,
  value: string,
  editingCliente?: any,
) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  switch (name) {
    case "nombres":
    case "apellidos": {
      const label = name === "nombres" ? "El nombre" : "El apellido";
      if (!value.trim()) return `${label} es obligatorio`;
      if (value.trim().length > 30)
        return `${label} no puede superar 30 caracteres`;
      return "";
    }
    case "numeroDocumento":
      if (!value.trim()) return "El documento es obligatorio";
      if (!/^[a-zA-Z0-9]+$/.test(value.trim())) {
        return "No se permiten caracteres especiales o espacios.";
      }
      if (value.trim().length < 8) return "Mínimo 8 caracteres";
      if (value.trim().length > 15) return "Máximo 15 caracteres";
      return "";
    case "email":
      if (!value.trim()) return "El email es obligatorio";
      if (!emailRegex.test(value.trim())) return "Formato de email inválido";
      if (value.trim().length > 40) return "Máximo 40 caracteres";
      return "";
    case "passwordHash":
      if (!editingCliente) {
        if (!value) return "La contraseña es obligatoria";
        if (value.length < 8) return "Mínimo 8 caracteres";
      }
      return "";
    case "telefono": {
      if (!value.trim()) return "El teléfono es obligatorio";
      if (!/^\d+$/.test(value)) {
        return "Solo se permiten números";
      }
      if (value.trim().length < 10) return "Mínimo 10 dígitos";
      if (value.trim().length > 15) return "Máximo 15 dígitos";
      return "";
    }
    case "direccion":
      if (value.trim() && value.trim().length < 10)
        return "Mínimo 10 caracteres";
      if (value.trim().length > 30) return "Máximo 30 caracteres";
      return "";
    case "ciudad":
      if (value.trim().length > 50) return "Máximo 50 caracteres";
      return "";
    case "departamento":
      if (value.trim().length > 50) return "Máximo 50 caracteres";
      if (value.trim().length < 3) return "Mínimo 3 caracteres";
      if (!value.trim()) return "El departamento es obligatorio";
      if (!/^[a-zA-Z]+$/.test(value.trim())) {
        return "No se permiten caracteres especiales o espacios.";
      }
      return "";
    default:
      return "";
  }
};

export const getClientStats = (clienteId: string, ventas: Venta[]) => {
  return ventas.filter(
    (v) => v.clienteId === clienteId && v.estado === "activo",
  ).length;
};

export const checkClientActiveConstraints = (
  clienteId: string,
  pedidos: Pedido[],
  ventas: Venta[],
) => {
  const pedidosActivos = pedidos.filter(
    (p) =>
      p.clienteId === clienteId &&
      !["entregado", "cancelado"].includes(p.estado),
  );
  const ventasActivas = ventas.filter(
    (v) => v.clienteId === clienteId && v.estado === "activo",
  );

  const constraints = [];
  if (pedidosActivos.length > 0)
    constraints.push(`${pedidosActivos.length} pedido(s) activo(s)`);
  if (ventasActivas.length > 0)
    constraints.push(`${ventasActivas.length} venta(s) activa(s)`);

  return {
    hasConstraints: constraints.length > 0,
    description: constraints.join(" y "),
  };
};
