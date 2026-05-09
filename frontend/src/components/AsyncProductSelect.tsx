import * as React from "react";
import * as ReactDOM from "react-dom";
import { Check, ChevronsUpDown } from "lucide-react";
import { productService } from "../services/productService";
import { Producto } from "../lib/store";

export function AsyncProductSelect({
  value,
  onChange,
  disabled,
  onlyWithStock = true,
}: {
  value: string;
  onChange: (val: string, producto?: Producto) => void;
  disabled?: boolean;
  onlyWithStock?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState<Producto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedProducto, setSelectedProducto] = React.useState<Producto | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [dropdownPos, setDropdownPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const syncSelected = async () => {
      if (!value) { setSelectedProducto(null); setInputValue(""); return; }
      const found = options.find(o => o.id === value);
      if (found) { setSelectedProducto(found); setInputValue(found.nombre); }
    };
    syncSelected();
  }, [value, options]);

  React.useEffect(() => {
    if (!inputValue || (selectedProducto && inputValue === selectedProducto.nombre)) {
      if (options.length === 0) searchProducts("");
      return;
    }
    const timer = setTimeout(() => searchProducts(inputValue), 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const searchProducts = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await productService.getAll({ q: searchQuery, limit: 10 });
      const mapped: Producto[] = res.data.map((p: any) => ({
        id: p.id_producto.toString(),
        nombre: p.nombre,
        descripcion: p.descripcion || "",
        categoriaId: p.id_categoria.toString(),
        marca: p.nombre_marca || p.id_marca?.toString() || "Genérica",
        precioCompra: Number(p.costo_promedio),
        precioVenta: Number(p.precio_venta),
        stock: p.stock_actual,
        stockFisico: p.stock_actual,
        stockMinimo: p.stock_min,
        stockMaximo: p.stock_max,
        imagenUrl: p.imagen_url || "",
        estado: p.estado ? "activo" : "inactivo",
        fechaCreacion: new Date().toISOString(),
      }));
      setOptions(mapped.filter(p => p.estado === "activo" && (onlyWithStock ? p.stock > 0 : true)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openDropdown = () => {
    if (disabled || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width });
    setOpen(true);
  };

  const closeDropdown = () => {
    setOpen(false);
    setSelectedIndex(-1);
    setInputValue(selectedProducto ? selectedProducto.nombre : "");
  };

  const selectProduct = (prod: Producto) => {
    onChange(prod.id, prod);
    setSelectedProducto(prod);
    setInputValue(prod.nombre);
    setOpen(false);
    setSelectedIndex(-1);
  };

  // Scroll automático al ítem activo
  React.useEffect(() => {
    if (!open || selectedIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLElement>("[data-option]");
    items[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) { openDropdown(); setSelectedIndex(0); }
        else setSelectedIndex(prev => prev < options.length - 1 ? prev + 1 : 0);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) { openDropdown(); setSelectedIndex(options.length - 1); }
        else setSelectedIndex(prev => prev > 0 ? prev - 1 : options.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        if (open && selectedIndex >= 0 && options[selectedIndex]) selectProduct(options[selectedIndex]);
        else { openDropdown(); setSelectedIndex(0); }
        break;
      case "Escape":
        e.preventDefault();
        closeDropdown();
        break;
      case "Tab":
        if (open) closeDropdown();
        break;
    }
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSelectedIndex(-1);
        setInputValue(selectedProducto ? selectedProducto.nombre : "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedProducto]);

  const dropdown = open && dropdownPos
    ? ReactDOM.createPortal(
        <div
          ref={listRef}
          style={{
            position: "absolute",
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 99999,
            pointerEvents: "all",
            cursor: "default",
            userSelect: "none",
          }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="max-h-[250px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {loading && (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-[#c47b96]/30 border-t-[#c47b96] rounded-full animate-spin" />
                Buscando...
              </div>
            )}
            {!loading && options.length === 0 && (
              <div className="px-4 py-3 text-sm text-center text-gray-400 italic">No se encontraron productos.</div>
            )}
            {!loading && options.map((prod, index) => {
              const isSelected = value === prod.id;
              const isHovered = index === selectedIndex;
              return (
                <div
                  key={prod.id}
                  data-option
                  onMouseEnter={() => setSelectedIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectProduct(prod)}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "13px",
                    fontWeight: 600,
                    transition: "all 0.15s ease",
                    background: isSelected
                      ? "#c47b96"
                      : isHovered
                        ? "#fdf2f6"
                        : "transparent",
                    color: isSelected
                      ? "#ffffff"
                      : isHovered
                        ? "#a85d77"
                        : "#4b5563",
                    boxShadow: isSelected
                      ? "0 1px 3px rgba(196,123,150,0.3)"
                      : "none",
                  }}
                >
                  <Check
                    className="flex-shrink-0"
                    style={{
                      width: 14,
                      height: 14,
                      marginRight: 10,
                      opacity: isSelected ? 1 : 0,
                      color: isSelected ? "#ffffff" : "transparent",
                    }}
                  />
                  <span className="truncate">{prod.nombre}</span>
                </div>
              );
            })}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          className={`flex w-full items-center justify-between bg-white border border-gray-200 text-gray-800 rounded-xl px-4 h-11 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c47b96]/20 focus:border-[#c47b96] ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          placeholder="Escribe el nombre o marca del producto..."
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={(e) => { setInputValue(e.target.value); openDropdown(); setSelectedIndex(0); }}
          onFocus={openDropdown}
          disabled={disabled}
        />
        <div
          className="absolute right-3 cursor-pointer text-gray-400 hover:text-gray-600"
          onClick={() => open ? closeDropdown() : openDropdown()}
        >
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </div>
      </div>
      {dropdown}
    </div>
  );
}
