"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, useNavigation } from "react-day-picker";
import { es } from "date-fns/locale";
import { format } from "date-fns";

import { cn } from "./utils";

/**
 * Custom caption rendered for each month in the calendar.
 *
 * When two months are displayed side by side (numberOfMonths=2):
 *   - First month  → [<] junio 2026 [ ]   (prev visible, next hidden)
 *   - Second month → [ ] julio 2026  [>]   (prev hidden, next visible)
 *
 * `displayMonths` comes from useNavigation (react-day-picker v8).
 */
function MultiMonthCaption({ displayMonth }: { displayMonth: Date }) {
  const { goToMonth, nextMonth, previousMonth, displayMonths } = useNavigation();

  const isFirst =
    displayMonths.length === 0 ||
    displayMonths[0].getTime() === displayMonth.getTime();
  const isLast =
    displayMonths.length === 0 ||
    displayMonths[displayMonths.length - 1].getTime() === displayMonth.getTime();

  const navBtnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.75rem",
    height: "1.75rem",
    borderRadius: "0.375rem",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "transparent",
    cursor: "pointer",
    opacity: 0.55,
    transition: "opacity 0.15s, background 0.15s",
    flexShrink: 0,
    padding: 0,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: "4px",
        paddingBottom: "2px",
        width: "100%",
      }}
    >
      {/* Previous month button — visible only on the first displayed month */}
      <button
        onClick={() => previousMonth && goToMonth(previousMonth)}
        disabled={!previousMonth}
        aria-label="Mes anterior"
        style={{
          ...navBtnStyle,
          visibility: isFirst ? "visible" : "hidden",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.background = "rgba(0,0,0,0.05)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.opacity = "0.55";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <ChevronLeft style={{ width: 14, height: 14 }} />
      </button>

      {/* Month + year label in Spanish, capitalised */}
      <span
        style={{
          fontSize: "0.875rem",
          fontWeight: 500,
          textTransform: "capitalize",
          color: "inherit",
        }}
      >
        {format(displayMonth, "MMMM yyyy", { locale: es })}
      </span>

      {/* Next month button — visible only on the last displayed month */}
      <button
        onClick={() => nextMonth && goToMonth(nextMonth)}
        disabled={!nextMonth}
        aria-label="Mes siguiente"
        style={{
          ...navBtnStyle,
          visibility: isLast ? "visible" : "hidden",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.background = "rgba(0,0,0,0.05)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.opacity = "0.55";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <ChevronRight style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}

/**
 * Calendar component based on react-day-picker.
 *
 * Key design decisions:
 * 1. Uses a custom Caption component (MultiMonthCaption) to correctly
 *    position prev/next buttons when numberOfMonths > 1.
 * 2. Passes locale={es} so day and month names appear in Spanish.
 * 3. Grid layout uses explicit rdp-* CSS classes (defined in index.css)
 *    instead of Tailwind utilities — Tailwind v4 does not scan dynamic
 *    classNames strings passed to third-party component props.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-6",
        month: "flex flex-col gap-2",
        caption: "flex items-center w-full",
        caption_label: "hidden", // replaced by MultiMonthCaption label
        nav: "hidden",           // replaced by MultiMonthCaption buttons
        table: "w-full border-collapse",
        head_row: "rdp-head-row-base",
        head_cell: "rdp-head-cell-base",
        row: "rdp-row-base",
        cell: "rdp-cell-base",
        day: "rdp-day-btn",
        day_range_start: "rdp-range-start",
        day_range_end: "rdp-range-end",
        day_selected: "rdp-selected",
        day_today: "rdp-today",
        day_outside: "rdp-outside",
        day_disabled: "rdp-disabled",
        day_range_middle: "rdp-range-middle",
        day_hidden: "rdp-hidden",
        ...classNames,
      }}
      components={{
        Caption: MultiMonthCaption,
      }}
      {...props}
    />
  );
}

export { Calendar };
