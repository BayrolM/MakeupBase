import { useState, useEffect, useRef } from "react";
import { StoreProvider, useStore } from "./lib/store";
import { ThemeProvider } from "./lib/theme-context";
import { Toaster } from "sonner";

// Hooks
import { useAuthLogic } from "./hooks/useAuthLogic";

// Components
import { GlobalLoader } from "./components/layout/GlobalLoader";
import { AuthOverlay, AuthPageType } from "./components/auth/AuthOverlay";
import { AppRouter, Route } from "./components/layout/AppRouter";
import { ClientLayout } from "./components/layout/ClientLayout";
import { AdminLayout } from "./components/layout/AdminLayout";

function AppContent() {
  const { userType, currentUser } = useStore();
  const [currentRoute, setCurrentRoute] = useState<Route>(
    userType === "admin" ? "dashboard" : "inicio"
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [productDetailId, setProductDetailId] = useState<string | null>(null);
  const [productDetailOrigin, setProductDetailOrigin] = useState<Route>(
    userType === "admin" ? "dashboard" : "inicio"
  );
  
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [authPage, setAuthPage] = useState<AuthPageType>("login");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    isAuthenticated,
    isLoading,
    isAuthTransitioning,
    authTransitionMessage,
    showInactiveModal,
    setShowInactiveModal,
    checkAuth,
    handleLogin,
    handleRegister,
    handleVerifyEmail,
    handleLogout,
  } = useAuthLogic();

  // Solucionar el bug de scroll al cambiar de página
  useEffect(() => {
    window.scrollTo(0, 0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentRoute]);

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar ruta cuando cambia el rol o autenticación
  useEffect(() => {
    if (isAuthenticated) {
      setCurrentRoute(userType === "admin" ? "dashboard" : "inicio");
    }
  }, [userType, isAuthenticated]);

  const handleAuthSuccess = (role: string) => {
    setShowAuthPage(false);
    setCurrentRoute(role === "cliente" ? "inicio" : "dashboard");
  };

  const handleLogoutSuccess = () => {
    setAuthPage("login");
    setCurrentRoute("inicio");
  };

  if (isLoading || isAuthTransitioning) {
    return <GlobalLoader message={authTransitionMessage} />;
  }

  const routerContent = (
    <AppRouter
      currentRoute={currentRoute}
      setCurrentRoute={setCurrentRoute}
      userType={userType}
      currentUser={currentUser}
      isAuthenticated={isAuthenticated}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      productDetailId={productDetailId}
      setProductDetailId={setProductDetailId}
      productDetailOrigin={productDetailOrigin}
      setProductDetailOrigin={setProductDetailOrigin}
      onRequireAuth={(page) => {
        setShowAuthPage(true);
        setAuthPage(page);
      }}
    />
  );

  return (
    <>
      <AuthOverlay
        show={showAuthPage}
        initialPage={authPage}
        onClose={() => setShowAuthPage(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onVerifyEmail={handleVerifyEmail}
        showInactiveModal={showInactiveModal}
        setShowInactiveModal={setShowInactiveModal}
        onAuthSuccess={handleAuthSuccess}
      />

      {userType === "cliente" ? (
        <ClientLayout
          currentRoute={currentRoute}
          setCurrentRoute={setCurrentRoute}
          setActiveCategory={setActiveCategory}
          setShowAuthPage={setShowAuthPage}
          setAuthPage={setAuthPage}
          onLogout={() => handleLogout(handleLogoutSuccess)}
          scrollRef={scrollContainerRef}
        >
          {routerContent}
        </ClientLayout>
      ) : (
        <AdminLayout
          currentRoute={currentRoute}
          setCurrentRoute={setCurrentRoute}
          setActiveCategory={setActiveCategory}
          onLogout={() => handleLogout(handleLogoutSuccess)}
          scrollRef={scrollContainerRef}
        >
          {routerContent}
        </AdminLayout>
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <AppContent />
        <Toaster />
      </StoreProvider>
    </ThemeProvider>
  );
}
