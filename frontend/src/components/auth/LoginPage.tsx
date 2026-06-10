import { useState } from 'react';
import { ChevronLeft, Eye, EyeOff, Mail, Lock, Sparkles, Shield } from 'lucide-react';

/* ── Luxury Theme Styling ── */
const C = {
  bgDeep: '#2e1020',
  pink: '#7b1347',
  pinkSoft: '#c47b96',
  accentDark: '#a85d77',
  accentSoft: '#fce8f0',
  cream: '#fffff2',
  textDark: '#1a1a1a',
  textMuted: '#6b7280',
  white: '#ffffff',
  danger: '#ef4444',
  success: '#10b981',
};

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean | void | Promise<boolean>;
  onNavigateToRegister: () => void;
  onNavigateToRecover: () => void;
  onBack?: () => void;
}

export function LoginPage({ onLogin, onNavigateToRegister, onNavigateToRecover, onBack }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    let errorMsg = '';
    if (!val) {
      errorMsg = 'El correo electrónico es obligatorio';
    } else if (!validateEmail(val)) {
      errorMsg = 'Formato de correo electrónico inválido';
    }
    setErrors(prev => ({ ...prev, email: errorMsg }));
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    let errorMsg = '';
    if (!val) {
      errorMsg = 'La contraseña es obligatoria';
    } else if (val.length < 8) {
      errorMsg = 'La contraseña debe tener al menos 8 caracteres';
    }
    setErrors(prev => ({ ...prev, password: errorMsg }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Formato de correo electrónico inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(ellipse at 50% 0%, #fffbfd 0%, #fff5f8 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '24px', 
      position: 'relative', 
      fontFamily: "'DM Sans', sans-serif", 
      overflow: 'hidden' 
    }}>
      
      {/* Background Decorative Blur Orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', background: 'rgba(196, 123, 150, 0.25)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: '500px', height: '500px', background: 'rgba(123, 19, 71, 0.12)', borderRadius: '50%', filter: 'blur(130px)', pointerEvents: 'none' }} />

      {/* Back Button */}
      {onBack && (
        <div className="hidden md:block" style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
          <button
            onClick={onBack}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              color: C.pinkSoft, background: 'rgba(255, 255, 255, 0.7)', 
              border: `1px solid ${C.accentSoft}`, 
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              transition: 'all 0.3s ease', padding: '10px 16px', borderRadius: '30px',
              boxShadow: '0 4px 12px rgba(123, 19, 71, 0.04)',
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.pink;
              e.currentTarget.style.transform = 'translateX(-3px)';
              e.currentTarget.style.borderColor = C.pinkSoft;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = C.pinkSoft;
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.borderColor = C.accentSoft;
            }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} />
            <span>Volver al portal</span>
          </button>
        </div>
      )}

      {/* Wrapper to align branding and form beautifully */}
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '1040px', 
          display: 'flex', 
          background: C.white,
          borderRadius: '32px', 
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(46, 16, 32, 0.08)',
          border: `1px solid rgba(252, 232, 240, 0.8)`,
          zIndex: 2,
          position: 'relative'
        }}
        className="flex-col md:flex-row"
      >
        
        {/* Left Side: Gorgeous Luxury Branding Panel */}
        <div 
          style={{ 
            flex: 1.1, 
            background: 'linear-gradient(158deg, #2e1020 0%, #3d1828 38%, #4a2035 62%, #2e1020 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="hidden md:flex flex-col justify-between p-8 md:p-12"
        >
          {/* Subtle patterns/mesh in background */}
          <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(196, 123, 150, 0.25) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '15%', left: '-15%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(123, 19, 71, 0.4) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          {/* Top Section: Brand Info */}
          <div style={{ zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '48px' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                overflow: 'hidden', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: 'transparent', 
                border: `2px solid ${C.pinkSoft}`,
                boxShadow: `0 0 20px rgba(196, 123, 150, 0.4)` 
              }}>
                <img src="/logo.png" alt="Glamour ML Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <h1 style={{ 
                  fontFamily: "'Cormorant Garamond', serif", 
                  fontSize: '34px', 
                  fontWeight: 600, 
                  color: C.cream, 
                  margin: 0, 
                  lineHeight: 1.1,
                  letterSpacing: '1px'
                }}>
                  GLAMOUR ML
                </h1>
                <p style={{ color: C.pinkSoft, fontSize: '12px', margin: 0, letterSpacing: '2px', fontWeight: 600, textTransform: 'uppercase', marginTop: '2px' }}>
                  Sistema de Gestión
                </p>
              </div>
            </div>

            <h2 style={{ 
              fontFamily: "'Cormorant Garamond', serif", 
              fontSize: '42px', 
              fontWeight: 400, 
              color: C.cream, 
              lineHeight: 1.2, 
              marginBottom: '24px',
              maxWidth: '440px'
            }}>
              Elegancia y precisión en cada detalle de tu negocio
            </h2>
            <p style={{ color: 'rgba(255, 255, 242, 0.75)', fontSize: '15px', lineHeight: 1.7, maxWidth: '400px', fontWeight: 400 }}>
              Accede a la plataforma exclusiva diseñada para optimizar el inventario, gestionar pedidos de alta gama y fidelizar a tus clientes con sofisticación.
            </p>
          </div>

          {/* Bottom Section: Key features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '48px', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles style={{ width: 18, height: 18, color: C.pinkSoft }} />
              </div>
              <div>
                <h4 style={{ color: C.cream, fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0' }}>Experiencia Premium</h4>
                <p style={{ color: 'rgba(255, 255, 242, 0.6)', fontSize: '12px', margin: 0 }}>Interfaz minimalista y fluida optimizada para el día a día.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield style={{ width: 18, height: 18, color: C.pinkSoft }} />
              </div>
              <div>
                <h4 style={{ color: C.cream, fontSize: '14px', fontWeight: 600, margin: '0 0 4px 0' }}>Seguridad de Nivel Empresarial</h4>
                <p style={{ color: 'rgba(255, 255, 242, 0.6)', fontSize: '12px', margin: 0 }}>Protección avanzada de datos, accesos de rol y transacciones.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Professional Modern Login Form */}
        <div 
          style={{ flex: 1, maxHeight: "90vh", overflowY: "auto", display: 'flex', flexDirection: 'column', background: C.white }} 
          className="p-8 md:p-12 lg:p-16"
        >
          {/* Mobile Header (Hidden on Desktop) */}
          <div
            className="md:hidden"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "32px",
            }}
          >
            {onBack ? (
              <button
                onClick={onBack}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: C.pink,
                  background: "rgba(196, 123, 150, 0.1)",
                  border: "1px solid rgba(196, 123, 150, 0.2)",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  padding: "6px 14px 6px 8px",
                  borderRadius: "20px",
                  transition: "all 0.2s"
                }}
              >
                <ChevronLeft style={{ width: 18, height: 18 }} /> Volver
              </button>
            ) : <div />}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                overflow: "hidden",
                border: `1.5px solid ${C.pinkSoft}`,
                background: "transparent",
              }}
            >
              <img
                src="/logo.png"
                alt="Glamour ML"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: '380px', margin: 'auto' }}>
            
            <div style={{ marginBottom: '36px' }}>
              <h2 style={{ 
                fontSize: '32px', 
                fontWeight: 600, 
                color: C.textDark, 
                marginBottom: '8px', 
                fontFamily: "'Cormorant Garamond', serif",
                letterSpacing: '-0.5px' 
              }}>
                Bienvenido
              </h2>
              <p style={{ fontSize: '14px', color: C.textMuted, margin: 0 }}>
                Ingresa tus credenciales de acceso para continuar.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Email field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="email" style={{ fontSize: '12px', fontWeight: 700, color: C.textDark, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Correo electrónico
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail style={{ position: 'absolute', left: '16px', color: C.pinkSoft, width: 18, height: 18 }} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="ejemplo@glamour.com"
                    style={{
                      width: '100%', 
                      height: '50px', 
                      borderRadius: '14px',
                      border: `1.5px solid ${errors.email ? C.danger : C.accentSoft}`,
                      padding: '0 16px 0 48px', 
                      outline: 'none', 
                      fontSize: '14px',
                      color: C.textDark, 
                      background: 'rgba(255, 255, 255, 0.6)', 
                      boxSizing: 'border-box',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = C.pink;
                      e.currentTarget.style.background = C.white;
                      e.currentTarget.style.boxShadow = `0 0 0 4px rgba(123, 19, 71, 0.08)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.email ? C.danger : C.accentSoft;
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                {errors.email && (
                  <p style={{ color: C.danger, fontSize: '11px', fontWeight: 600, margin: 0, marginTop: '2px' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="password" style={{ fontSize: '12px', fontWeight: 700, color: C.textDark, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={onNavigateToRecover}
                    style={{ background: 'none', border: 'none', color: C.pinkSoft, cursor: 'pointer', fontSize: '12px', fontWeight: 600, padding: 0 }}
                    onMouseEnter={(e) => e.currentTarget.style.color = C.pink}
                    onMouseLeave={(e) => e.currentTarget.style.color = C.pinkSoft}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock style={{ position: 'absolute', left: '16px', color: C.pinkSoft, width: 18, height: 18 }} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%', 
                      height: '50px', 
                      borderRadius: '14px',
                      border: `1.5px solid ${errors.password ? C.danger : C.accentSoft}`,
                      padding: '0 48px 0 48px', 
                      outline: 'none', 
                      fontSize: '14px',
                      color: C.textDark, 
                      background: 'rgba(255, 255, 255, 0.6)', 
                      boxSizing: 'border-box',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = C.pink;
                      e.currentTarget.style.background = C.white;
                      e.currentTarget.style.boxShadow = `0 0 0 4px rgba(123, 19, 71, 0.08)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.password ? C.danger : C.accentSoft;
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: C.pinkSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ color: C.danger, fontSize: '11px', fontWeight: 600, margin: 0, marginTop: '2px' }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Keep session checked */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    accentColor: C.pink, 
                    cursor: 'pointer', 
                    borderRadius: '4px',
                    border: `1.5px solid ${C.accentSoft}`
                  }}
                />
                <label htmlFor="remember" style={{ color: C.textDark, cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                  Mantener sesión iniciada
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', 
                  height: '52px', 
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #7b1347 0%, #a85d77 100%)', 
                  color: C.white, 
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px', 
                  fontWeight: 600, 
                  letterSpacing: '1px',
                  boxShadow: `0 8px 24px rgba(123, 19, 71, 0.2)`, 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginTop: '8px',
                  opacity: isLoading ? 0.7 : 1,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 12px 28px rgba(123, 19, 71, 0.35)`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 8px 24px rgba(123, 19, 71, 0.2)`;
                  }
                }}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '18px', 
                        height: '18px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: C.white,
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    INICIANDO SESIÓN...
                  </span>
                ) : (
                  'INGRESAR AL SISTEMA'
                )}
              </button>
            </form>

            <div style={{ marginTop: '36px', textAlign: 'center', paddingTop: '24px', borderTop: `1px solid ${C.accentSoft}` }}>
              <span style={{ color: C.textMuted, fontSize: '13px', marginRight: '6px' }}>
                ¿Aún no tienes cuenta?
              </span>
              <button
                onClick={onNavigateToRegister}
                style={{ background: 'none', border: 'none', color: C.pink, cursor: 'pointer', fontSize: '13px', fontWeight: 700, transition: 'color 0.2s', padding: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.color = C.accentDark}
                onMouseLeave={(e) => e.currentTarget.style.color = C.pink}
              >
                Regístrate ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}