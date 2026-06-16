import React from "react";

interface GlobalLoaderProps {
  message?: string;
}

export function GlobalLoader({ message = "Cargando Makeup Base..." }: GlobalLoaderProps) {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'radial-gradient(circle at 50% 50%, #fffcfd 0%, #f7f0f3 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', 'DM Sans', sans-serif",
        animation: 'fadeInOverlay 0.4s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes softPulse {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.02); opacity: 1; }
        }
      `}</style>
      
      <div 
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(123, 19, 71, 0.08)',
          borderRadius: '24px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          maxWidth: '360px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(123, 19, 71, 0.05)',
          animation: 'softPulse 3s infinite ease-in-out'
        }}
      >
        <div 
          style={{
            position: 'relative',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div 
            className="animate-spin"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              border: '3px solid rgba(123, 19, 71, 0.08)',
              borderTopColor: '#7b1347',
              borderRadius: '50%',
              animationDuration: '1s'
            }}
          />
          <span 
            style={{
              fontSize: '14px',
              fontWeight: 800,
              color: '#7b1347',
              letterSpacing: '0.5px'
            }}
          >
            MB
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h2 
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: '#7b1347',
              letterSpacing: '0.5px'
            }}
          >
            {message}
          </h2>
          <p 
            style={{
              fontSize: '11px',
              color: 'rgba(123, 19, 71, 0.6)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontWeight: 700
            }}
          >
            Un momento por favor
          </p>
        </div>
      </div>
    </div>
  );
}
