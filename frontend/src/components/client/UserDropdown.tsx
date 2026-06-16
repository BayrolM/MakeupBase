import { useState, useRef, useEffect } from "react";
import { useStore } from "../../lib/store";
import { ChevronDown, User, LogOut } from "lucide-react";
import { LogoutConfirmDialog } from "../layout/LogoutConfirmDialog";

interface UserDropdownProps {
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

export function UserDropdown({ onNavigate, onLogout }: UserDropdownProps) {
  const { currentUser } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!currentUser) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((p) => !p)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-primary/5 transition-colors"
        >
          {currentUser?.foto_perfil ? (
            <img
              src={currentUser.foto_perfil}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <span className="text-primary text-xs font-bold">
                {currentUser?.nombres?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {dropdownOpen && (
          <>
            <style>{`
              @keyframes dropdownFade {
                from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>
            <div
              className="absolute right-0 top-full mt-3 w-64 rounded-2xl overflow-hidden z-50"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #f0d5e0",
                boxShadow: "0 20px 40px -10px rgba(196,123,150,0.25)",
                animation: "dropdownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                transformOrigin: "top right",
              }}
            >
              {/* Header Profile Area */}
              <div
                className="px-5 py-4 flex items-center gap-3"
                style={{
                  background: "linear-gradient(to right, #fff8fb, #ffffff)",
                  borderBottom: "1px solid #f0d5e0",
                }}
              >
                {currentUser?.foto_perfil ? (
                  <img
                    src={currentUser.foto_perfil}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                    style={{ border: "2px solid #ffffff" }}
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                    style={{ background: "#f0d5e0", border: "2px solid #ffffff" }}
                  >
                    <span style={{ color: "#c47b96", fontWeight: "bold" }}>
                      {currentUser?.nombres?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-bold truncate"
                    style={{ color: "#1a1a1a" }}
                  >
                    {currentUser?.nombres} {currentUser?.apellidos}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "#666666" }}
                  >
                    {currentUser?.email}
                  </p>
                </div>
              </div>

              {/* Menu Options */}
              <div className="p-2 flex flex-col gap-1 bg-white">
                <button
                  onClick={() => {
                    onNavigate("perfil");
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left font-medium group"
                  style={{ color: "#1a1a1a" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fff8fb";
                    e.currentTarget.style.color = "#c47b96";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#1a1a1a";
                  }}
                >
                  <div
                    className="p-1.5 rounded-lg transition-colors group-hover:bg-white group-hover:shadow-sm"
                    style={{ color: "#666666" }}
                  >
                    <User className="w-4 h-4 transition-colors" />
                  </div>
                  Mi Perfil
                </button>

                <button
                  onClick={() => {
                    setShowLogoutConfirm(true);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left font-medium group"
                  style={{ color: "#1a1a1a" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fef2f2"; // red-50
                    e.currentTarget.style.color = "#dc2626"; // red-600
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#1a1a1a";
                  }}
                >
                  <div
                    className="p-1.5 rounded-lg transition-colors group-hover:bg-white group-hover:shadow-sm"
                    style={{ color: "#666666" }}
                  >
                    <LogOut className="w-4 h-4 transition-colors" />
                  </div>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <LogoutConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={onLogout}
      />
    </>
  );
}
