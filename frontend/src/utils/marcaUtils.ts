import { Marca, Producto } from "../lib/store";

/**
 * Valida el nombre de una marca
 */
export const validateMarcaNombre = (
  nombre: string,
  marcas: Marca[],
  editingId?: string,
) => {
  if (!nombre.trim()) return "El nombre es obligatorio";
  if (nombre.length < 2) return "El nombre debe tener al menos 2 caracteres";

  const duplicate = marcas.find(
    (m) =>
      m.nombre.toLowerCase().trim() === nombre.toLowerCase().trim() &&
      m.id !== editingId,
  );

  if (duplicate) return "Ya existe una marca con este nombre";

  return "";
};

/**
 * Obtiene la cantidad de productos asociados a una marca
 */
export const getMarcaProductCount = (marcaId: string, productos: Producto[]) => {
  return productos.filter((p) => p.marcaId === marcaId).length;
};
