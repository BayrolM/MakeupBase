import React, { useState, useEffect } from "react";
import { LoginPage } from "./LoginPage";
import { RegisterPageColombia } from "./RegisterPageColombia";
import { RecoverPage } from "./RecoverPage";
import { InactiveAccountModal } from "./InactiveAccountModal";

export type AuthPageType = "login" | "register" | "recover";

interface AuthOverlayProps {
  show: boolean;
  initialPage?: AuthPageType;
  onClose: () => void;
  onLogin: (email: string, pass: string, onSuccess: (role: string) => void) => Promise<boolean>;
  onRegister: (data: any) => Promise<void>;
  onVerifyEmail: (email: string, code: string, onSuccess: (role: string) => void) => Promise<boolean>;
  onRecover?: (email: string) => void;
  showInactiveModal: boolean;
  setShowInactiveModal: (val: boolean) => void;
  onAuthSuccess: (role: string) => void;
}

export function AuthOverlay({
  show,
  initialPage = "login",
  onClose,
  onLogin,
  onRegister,
  onVerifyEmail,
  onRecover = () => {},
  showInactiveModal,
  setShowInactiveModal,
  onAuthSuccess,
}: AuthOverlayProps) {
  const [authPage, setAuthPage] = useState<AuthPageType>(initialPage);
  const [recoverToken, setRecoverToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (show) {
      setAuthPage(initialPage);
    }
  }, [show, initialPage]);

  // Verificar si hay un token de recuperación en la URL al cargar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setRecoverToken(token);
      setAuthPage("recover");
      // Limpiar la URL sin recargar la página
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Bloquear el scroll del body cuando el overlay está activo
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  if (!show && !showInactiveModal) return null;

  return (
    <>
      {show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 99999, overflowY: 'auto', backgroundColor: '#fff' }}>
          {authPage === "login" && (
            <LoginPage
              onLogin={(email, pass) => onLogin(email, pass, onAuthSuccess)}
              onNavigateToRegister={() => setAuthPage("register")}
              onNavigateToRecover={() => setAuthPage("recover")}
              onBack={onClose}
            />
          )}
          {authPage === "register" && (
            <RegisterPageColombia
              onRegister={onRegister}
              onVerifyEmail={(email, code) => onVerifyEmail(email, code, onAuthSuccess)}
              onNavigateToLogin={() => setAuthPage("login")}
              onBack={onClose}
            />
          )}
          {authPage === "recover" && (
            <RecoverPage
              initialToken={recoverToken}
              onRecover={(email) => {
                onRecover(email);
              }}
              onNavigateToLogin={() => {
                setAuthPage("login");
                setRecoverToken(undefined);
              }}
              onBack={() => {
                onClose();
                setRecoverToken(undefined);
              }}
            />
          )}
        </div>
      )}

      {/* Modal: cuenta inactiva */}
      <InactiveAccountModal
        open={showInactiveModal}
        onOpenChange={setShowInactiveModal}
      />
    </>
  );
}
