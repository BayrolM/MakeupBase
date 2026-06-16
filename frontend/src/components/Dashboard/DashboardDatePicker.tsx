import React, { useState } from "react";
import { CalendarRange, X, ChevronDown } from "lucide-react";
import { DateRange } from "../../hooks/useDashboardData";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";

interface DashboardDatePickerProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const PRESETS = [
  { label: "Todas las fechas", key: "all" },
  { label: "Hoy",             key: "today" },
  { label: "Ayer",            key: "yesterday" },
  { label: "Últimos 7 días",  key: "last7" },
  { label: "Últimos 30 días", key: "last30" },
  { label: "Este mes",        key: "thisMonth" },
];

function applyPreset(key: string): DateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (key) {
    case "all":
      return {};
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return { from: y, to: y };
    }
    case "last7": {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      return { from, to: today };
    }
    case "last30": {
      const from = new Date(today);
      from.setDate(from.getDate() - 29);
      return { from, to: today };
    }
    case "thisMonth": {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from, to: today };
    }
    default:
      return {};
  }
}

function formatDate(d?: Date) {
  if (!d) return "";
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function getActivePresetKey(range: DateRange): string {
  if (!range.from && !range.to) return "all";

  const presetKeys = ["today", "yesterday", "last7", "last30", "thisMonth"];
  for (const key of presetKeys) {
    const p = applyPreset(key);
    const fromMatch = p.from?.toDateString() === range.from?.toDateString();
    const toMatch   = p.to?.toDateString()   === range.to?.toDateString();
    if (fromMatch && toMatch) return key;
  }
  return "custom";
}

export function DashboardDatePicker({ dateRange, setDateRange }: DashboardDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(dateRange);

  const activeKey = getActivePresetKey(dateRange);
  const hasFilter = !!(dateRange.from || dateRange.to);

  const triggerLabel = hasFilter
    ? dateRange.from && dateRange.to && dateRange.from.toDateString() === dateRange.to.toDateString()
      ? formatDate(dateRange.from)
      : `${formatDate(dateRange.from)} — ${formatDate(dateRange.to)}`
    : "Todas las fechas";

  const handlePreset = (key: string) => {
    const range = applyPreset(key);
    setTempRange(range);
    setDateRange(range);
    if (key !== "custom") setOpen(false);
  };

  const handleCalendarSelect = (selected: any) => {
    const range: DateRange = { from: selected?.from, to: selected?.to };
    setTempRange(range);
    if (range.from && range.to) {
      setDateRange(range);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempRange({});
    setDateRange({});
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* ── Trigger Button ── lives inside the PageHeader (dark gradient bg) */}
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 16px",
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: "12px",
            color: "#fffff2",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.20)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
        >
          <CalendarRange style={{ width: 15, height: 15, opacity: 0.9 }} />
          <span>{triggerLabel}</span>
          {hasFilter ? (
            <span
              onClick={handleClear}
              title="Limpiar filtro"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.35)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
            >
              <X style={{ width: 9, height: 9 }} />
            </span>
          ) : (
            <ChevronDown style={{ width: 13, height: 13, opacity: 0.7 }} />
          )}
        </button>
      </PopoverTrigger>

      {/* ── Popover Content ── */}
      <PopoverContent
        align="end"
        sideOffset={10}
        style={{
          width: "auto",
          padding: 0,
          borderRadius: "20px",
          border: "1px solid rgba(196, 123, 150, 0.2)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(123,19,71,0.1)",
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ display: "flex", minWidth: 580 }}>
          {/* Left panel — presets */}
          <div
            style={{
              width: 170,
              padding: "16px 12px",
              borderRight: "1px solid rgba(196,123,150,0.15)",
              background: "#fdf9fb",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--luxury-text-muted, #a0809a)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 6,
                paddingLeft: 8,
              }}
            >
              Acceso rápido
            </p>
            {PRESETS.map(preset => {
              const isActive = activeKey === preset.key;
              return (
                <button
                  key={preset.key}
                  onClick={() => handlePreset(preset.key)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "none",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#7b1347" : "#4a2035",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(196,123,150,0.18) 0%, rgba(123,19,71,0.12) 100%)"
                      : "transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = "rgba(196,123,150,0.1)";
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {preset.label}
                </button>
              );
            })}

            {hasFilter && (
              <>
                <div
                  style={{
                    height: 1,
                    background: "rgba(196,123,150,0.15)",
                    margin: "8px 0",
                  }}
                />
                <button
                  onClick={() => handlePreset("all")}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid rgba(196,123,150,0.3)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#7b1347",
                    background: "transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(196,123,150,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <X style={{ width: 11, height: 11 }} />
                  Limpiar filtro
                </button>
              </>
            )}
          </div>

          {/* Right panel — calendar */}
          <div
            style={{
              padding: "12px 8px",
              background: "#ffffff",
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--luxury-text-muted, #a0809a)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 4,
                paddingLeft: 8,
              }}
            >
              Rango personalizado
            </p>
            <Calendar
              mode="range"
              selected={{
                from: tempRange.from,
                to: tempRange.to,
              }}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              toDate={new Date()}
            />
          </div>
        </div>

        {/* Bottom bar — summary */}
        {(tempRange.from || tempRange.to) && (
          <div
            style={{
              padding: "10px 20px",
              borderTop: "1px solid rgba(196,123,150,0.12)",
              background: "#fdf9fb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 12, color: "#7b1347", fontWeight: 500 }}>
              {tempRange.from && tempRange.to
                ? `${formatDate(tempRange.from)} — ${formatDate(tempRange.to)}`
                : tempRange.from
                ? `Desde ${formatDate(tempRange.from)}`
                : ""}
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                padding: "6px 18px",
                background: "linear-gradient(135deg, #7b1347, #a85d77)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.15s",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              Aplicar
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
