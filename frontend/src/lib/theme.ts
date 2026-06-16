const V = (name: string) => `var(--luxury-${name})`;

export const C = {
  accent: V("pink-soft"),
  accentDark: V("accent-dark"),
  accentDeep: V("pink"),
  accentSoft: V("accent-soft"),
  bgSoft: V("bg-soft"),
  bgHeader: V("bg-header"),
  textDark: V("text-dark"),
  textSecondary: V("text-secondary"),
  textMuted: V("text-muted"),
  white: "#ffffff",
  deep: V("deep"),
  cream: V("cream"),
  shadow: V("shadow"),
  shadowXs: V("shadow-xs"),
  shadowSm: V("shadow-sm"),
  shadowLg: V("shadow-lg"),
};
