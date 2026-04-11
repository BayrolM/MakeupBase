import * as React from "react";
import * as ReactDOM from "react-dom";
import { Check, ChevronsUpDown } from "lucide-react";
import { userService } from "../services/userService";

export function AsyncClientSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedCliente, setSelectedCliente] = React.useState<any | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [dropdownPos, setDropdownPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const syncSelected = async () => {
      if (!value) { setSelectedCliente(null); setInputValue(""); return; }
      const found = options.find(o => o.id === value);
      if (found) { setSelectedCliente(found); setInputValue(found.nombre); }
    };
    syncSelected();
  }, [value, options]);

  React.useEffect(() => {
    if (!inputValue || (selectedCliente && inputValue === selectedCliente.nombre)) {
      if (options.length === 0) searchClients("");
      return;
    }
    const timer = setTimeout(() => searchClients(inputValue), 400);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const searchClients = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await userService.getAll({ id_rol: 2, q: searchQuery, limit: 10 });
      const mapped = res.data.map((u: any) => ({
        id: u.id_usuario.toString(),
        nombre: `${u.nombres || u.nombre || ""} ${u.apellidos || u.apellido || ""}`.trim(),
        documento: u.documento,
      }));
      setOptions(mapped);
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
    setInputValue(selectedCliente ? selectedCliente.nombre : "");
  };

  const selectClient = (client: any) => {
    onChange(client.id);
    setSelectedCliente(client);
    setInputValue(client.nombre);
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
        if (open && selectedIndex >= 0 && options[selectedIndex]) selectClient(options[selectedIndex]);
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
        setInputValue(selectedCliente ? selectedCliente.nombre : "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedCliente]);

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
          <div className="max-h-[250px] overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {loading && (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-[#c47b96]/30 border-t-[#c47b96] rounded-full animate-spin" />
                Buscando...
              </div>
            )}
            {!loading && options.length === 0 && (
              <div className="px-4 py-3 text-sm text-center text-gray-500 italic">No se encontraron resultados.</div>
            )}
            {!loading && options.map((client, index) => (
              <div
                key={client.id}
                data-option
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setSelectedIndex(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectClient(client)}
                className={`relative flex items-center rounded-lg px-3 py-2.5 text-sm transition-all mx-1 mb-0.5 ${
                  value === client.id
                    ? "bg-[#c47b96] text-white font-semibold shadow-sm"
                    : index === selectedIndex
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-700 font-medium"
                }`}
              >
                <Check className={`mr-3 h-4 w-4 shrink-0 ${value === client.id ? "opacity-100" : "opacity-0"}`} />
                <span className="truncate">{client.nombre}</span>
              </div>
            ))}
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
          placeholder="Escribe nombre o documento..."
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
