import React from "react";
import { ClientNavbar } from "../client/ClientNavbar";
import { Route } from "./AppRouter";
import { AuthPageType } from "../auth/AuthOverlay";

interface ClientLayoutProps {
  currentRoute: Route;
  setCurrentRoute: (route: Route) => void;
  setActiveCategory: (catId: string | null) => void;
  setShowAuthPage: (show: boolean) => void;
  setAuthPage: (page: AuthPageType) => void;
  onLogout: (onSuccess: () => void) => void;
  children: React.ReactNode;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

import { useDataLoaders } from "../../hooks/useDataLoaders";

export function ClientLayout({
  currentRoute,
  setCurrentRoute,
  setActiveCategory,
  setShowAuthPage,
  setAuthPage,
  onLogout,
  children,
  scrollRef,
}: ClientLayoutProps) {
  const { loadPublicData } = useDataLoaders();

  React.useEffect(() => {
    // Polling public data to keep categories and brands synced in "real time"
    const interval = setInterval(() => {
      loadPublicData();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [loadPublicData]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ClientNavbar
        currentRoute={currentRoute}
        onNavigate={(route) => {
          if (route === "login" || route === "register") {
            setShowAuthPage(true);
            setAuthPage(route as AuthPageType);
          } else {
            if (route === "catalogo") setActiveCategory(null);
            setCurrentRoute(route as Route);
          }
        }}
        onLogout={() => onLogout(() => {})}
      />
      <main ref={scrollRef} className="flex-1">
        {children}
      </main>
    </div>
  );
}
