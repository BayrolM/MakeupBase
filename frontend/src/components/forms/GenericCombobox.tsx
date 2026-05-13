import * as React from "react";
import * as ReactDOM from "react-dom";
import { Check, ChevronsUpDown, X } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface GenericComboboxProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

let instanceCounter = 0;

export function GenericCombobox({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  disabled = false,
  className = "",
}: GenericComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [dropdownPos, setDropdownPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const instanceId = React.useRef(`gcb-${++instanceCounter}`);
  const listboxId = `${instanceId.current}-listbox`;
  const getOptionId = (index: number) => `${instanceId.current}-option-${index}`;

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  React.useEffect(() => {
    setInputValue(selectedOption ? selectedOption.label : "");
  }, [selectedOption]);

  const filteredOptions = React.useMemo(() => {
    const query = inputValue.toLowerCase().trim();
    if (!query || selectedOption?.label === inputValue) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, inputValue, selectedOption]);

  // Scroll automático al ítem activo cuando cambia selectedIndex
  React.useEffect(() => {
    if (!open || selectedIndex < 0 || !listRef.current) return;
    const item = listRef.current.querySelector<HTMLElement>(`#${getOptionId(selectedIndex)}`);
    item?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, open]);

  const calcPos = () => {
    if (!wrapperRef.current) return null;
    const rect = wrapperRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    };
  };

  const openDropdown = () => {
    if (disabled) return;
    const pos = calcPos();
    if (pos) setDropdownPos(pos);
    setOpen(true);
  };

  const closeDropdown = () => {
    setOpen(false);
    setSelectedIndex(-1);
    setInputValue(selectedOption ? selectedOption.label : "");
  };

  const selectOption = (option: Option) => {
    onChange(option.value);
    setInputValue(option.label);
    setOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) {
          openDropdown();
          setSelectedIndex(0);
        } else {
          setSelectedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!open) {
          openDropdown();
          setSelectedIndex(filteredOptions.length - 1);
        } else {
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;

      case "Enter":
        e.preventDefault();
        if (open && selectedIndex >= 0 && filteredOptions[selectedIndex]) {
          selectOption(filteredOptions[selectedIndex]);
        } else {
          openDropdown();
          setSelectedIndex(0);
        }
        break;

      case "Escape":
        e.preventDefault();
        closeDropdown();
        break;

      case "Tab":
        if (open) closeDropdown();
        break;

      case "Home":
        if (open) { e.preventDefault(); setSelectedIndex(0); }
        break;

      case "End":
        if (open) { e.preventDefault(); setSelectedIndex(filteredOptions.length - 1); }
        break;
    }
  };

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSelectedIndex(-1);
        setInputValue(selectedOption ? selectedOption.label : "");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [selectedOption]);

  const activeDescendant =
    open && selectedIndex >= 0 ? getOptionId(selectedIndex) : undefined;

  const dropdown =
    open && dropdownPos
      ? ReactDOM.createPortal(
          <div
            id={listboxId}
            role="listbox"
            aria-label={placeholder}
            ref={listRef}
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 99999,
              // Fix bug 2: forzar que el portal capture todos los eventos de mouse
              // sin importar qué elemento haya debajo
              pointerEvents: "all",
              cursor: "default",
              userSelect: "none",
            }}
            className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="max-h-[280px] overflow-y-auto p-1 scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div
                  role="option"
                  aria-selected={false}
                  className="p-4 text-sm text-center text-gray-400 italic"
                >
                  No hay resultados
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = value === option.value;
                  const isHovered = index === selectedIndex;
                  return (
                    <div
                      key={option.value}
                      id={getOptionId(index)}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      onClick={() => selectOption(option)}
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
                      <span className="truncate">{option.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      <div className="relative group">
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-disabled={disabled}
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setInputValue(e.target.value);
            openDropdown();
            setSelectedIndex(0);
          }}
          onFocus={openDropdown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-white border border-gray-200 text-gray-800 rounded-xl px-4 pr-10 h-11 text-sm transition-all 
            focus:ring-2 focus:ring-[#c47b96]/20 focus:border-[#c47b96] outline-none
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && !disabled && (
            <X
              aria-label="Limpiar selección"
              className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={() => {
                onChange("");
                setInputValue("");
              }}
            />
          )}
          <ChevronsUpDown
            aria-hidden="true"
            className="h-4 w-4 text-gray-400 cursor-pointer"
            onClick={() => (open ? closeDropdown() : openDropdown())}
          />
        </div>
      </div>
      {dropdown}
    </div>
  );
}
