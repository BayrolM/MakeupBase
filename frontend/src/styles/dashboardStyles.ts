/* ── Luxury CSS variable helpers ── */
export const V = (name: string) => `var(--luxury-${name})`;

export const C = {
  bgSoft: V("bg-soft"),
  accent: V("pink-soft"),
  accentDark: V("accent-dark"),
  accentDeep: V("pink"),
  textDark: V("text-dark"),
  textMuted: V("text-muted"),
  shadowSm: V("shadow-sm"),
  shadow: V("shadow"),
  white: "#ffffff",
  danger: "#ef4444",
  success: "#10b981",
  blue: "#3b82f6",
};

export const statusColors = ["#7b1347", "#a85d77", "#c47b96", "#10b981", "#ef4444"];
