import React from "react";
import { LucideIcon } from "lucide-react";
import { C } from "../../styles/dashboardStyles";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  isNegative?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend }) => {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: "20px",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: `1px solid ${C.accent}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "80px",
          height: "80px",
          background: `linear-gradient(135deg, transparent 50%, ${C.accent} 100%)`,
          opacity: 0.3,
        }}
      />
      <div className="flex justify-between items-start mb-4">
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "var(--luxury-bg-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon style={{ width: 20, height: 20, color: C.accentDeep }} />
        </div>
        {trend && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: C.success,
              background: `${C.success}15`,
              padding: "4px 8px",
              borderRadius: "20px",
            }}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <h4
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: C.textMuted,
            margin: "0 0 4px 0",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </h4>
        <p
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: C.textDark,
            margin: 0,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
};
