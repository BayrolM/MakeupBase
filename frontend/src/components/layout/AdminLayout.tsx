import React from "react";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { NotificationBell } from "./NotificationBell";
import { Route } from "./AppRouter";

interface AdminLayoutProps {
  currentRoute: Route;
  setCurrentRoute: (route: Route) => void;
  setActiveCategory: (catId: string | null) => void;
  onLogout: (onSuccess: () => void) => void;
  children: React.ReactNode;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function AdminLayout({
  currentRoute,
  setCurrentRoute,
  setActiveCategory,
  onLogout,
  children,
  scrollRef,
}: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar
          onNavigate={(route) => {
            if (route === "catalogo") setActiveCategory(null);
            setCurrentRoute(route as Route);
          }}
          currentRoute={currentRoute}
          onLogout={() => onLogout(() => {})}
        />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Admin Header */}
          <div className="md:hidden flex items-center justify-between p-3 bg-white border-b border-gray-100 z-10 shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-[#c47b96] hover:bg-[#fce8f0] w-9 h-9" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black border border-[#c47b96]">
                  <img src="/logo.png" alt="Glamour ML" className="w-5 h-5 object-contain" />
                </div>
                <span className="font-semibold text-sm tracking-widest uppercase text-gray-800" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Glamour ML</span>
              </div>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
      <NotificationBell 
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route as Route)}
      />
    </SidebarProvider>
  );
}
