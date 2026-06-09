import { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import { UserCircle, CheckCircle, Lock, Eye, EyeOff, Camera, Loader2, Save, X, Check, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { authService } from '../../services/authService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useRef } from 'react';

/* ── Luxury CSS variable helpers ── */
const V = (name: string) => `var(--luxury-${name})`;
const C = {
  bgSoft: V('bg-soft'),
  accent: V('pink-soft'),
  accentDark: V('accent-dark'),
  accentDeep: V('pink'),
  textDark: V('text-dark'),
  textMuted: V('text-muted'),
  shadowSm: V('shadow-sm'),
  shadow: V('shadow'),
  white: '#ffffff',
  danger: '#ef4444',
  success: '#10b981',
};


// Luxury UI Form Components
const InputField = ({ label, id, value, onChange, disabled, error, type = "text", placeholder = "" }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label htmlFor={id} style={{ fontSize: '13px', fontWeight: 600, color: C.textMuted }}>
      {label} <span style={{ color: C.danger }}>*</span>
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      style={{
        width: '100%', height: '44px', borderRadius: '12px',
        border: `1px solid ${error ? C.danger : C.accentDark}`,
        padding: '0 16px', outline: 'none', fontSize: '14px',
        color: disabled ? C.textMuted : C.textDark,
        background: disabled ? '#f9fafb' : C.white,
        boxSizing: 'border-box',
        transition: 'all 0.2s',
      }}
      onFocus={(e) => {
        if(!disabled) e.currentTarget.style.borderColor = C.accentDeep;
        if(!disabled) e.currentTarget.style.boxShadow = `0 0 0 3px ${C.accent}`;
      }}
      onBlur={(e) => {
        if(!disabled) e.currentTarget.style.borderColor = error ? C.danger : C.accentDark;
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
    {error && <p style={{ color: C.danger, fontSize: '12px', margin: 0 }}>{error}</p>}
  </div>
);

export function PerfilView() {
  const { currentUser, setCurrentUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password Change State
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    codigoVerificacion: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    nombres: currentUser?.nombres || '',
    apellidos: currentUser?.apellidos || '',
    email: currentUser?.email || '',
    telefono: currentUser?.telefono || '',
    direccion: currentUser?.direccion || '',
    ciudad: currentUser?.ciudad || '',
    recibirOfertas: true,
    notificacionesPush: false,
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        nombres: currentUser.nombres,
        apellidos: currentUser.apellidos,
        email: currentUser.email,
        telefono: currentUser.telefono,
        direccion: currentUser.direccion || '',
        ciudad: currentUser.ciudad || '',
      }));
    }
  }, [currentUser]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombres) newErrors.nombres = 'El nombre es obligatorio';
    if (!formData.apellidos) newErrors.apellidos = 'El apellido es obligatorio';
    
    if (!formData.email) {
      newErrors.email = 'El email es obligatorio';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d+$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe contener solo números';
    }

    if (!formData.direccion) newErrors.direccion = 'La dirección es obligatoria';
    if (!formData.ciudad) newErrors.ciudad = 'La ciudad es obligatoria';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});
    
    try {
      await authService.updateProfile({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        telefono: formData.telefono,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
      });

      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          telefono: formData.telefono,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
        });
      }

      setIsEditing(false);
      setShowSuccess(true);
      toast.success('Perfil actualizado correctamente');
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      toast.error('Error al actualizar perfil', {
        description: error.message || 'Inténtalo de nuevo más tarde'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Formato inválido', { description: 'Por favor selecciona una imagen (PNG, JPG, etc.)' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Archivo muy pesado', { description: 'La imagen debe ser menor a 2MB' });
      return;
    }

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

      await authService.updateProfile({ foto_perfil: publicUrl });
      
      setCurrentUser({
        ...currentUser,
        foto_perfil: publicUrl
      });

      toast.success('Foto de perfil actualizada');
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      toast.error('Error al subir la imagen', {
        description: error.message || 'Verifica que el bucket "avatars" exista y tenga permisos de subida públicos.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendCode = async () => {
    setIsSendingCode(true);
    try {
      await authService.requestPasswordChangeCode();
      toast.success('Código enviado al correo');
      setPasswordStep(2);
    } catch (error: any) {
      toast.error('Error al solicitar código', {
        description: error.message || 'Inténtalo de nuevo'
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleChangePassword = async () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.codigoVerificacion) newErrors.codigoVerificacion = 'El código es obligatorio';
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es obligatoria';
    } else if (passwordData.newPassword.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'La contraseña no cumple con los requisitos';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setIsChangingPassword(true);
    setPasswordErrors({});

    try {
      await authService.changePassword(passwordData.newPassword, passwordData.codigoVerificacion);
      toast.success('Contraseña actualizada correctamente');
      setIsPasswordDialogOpen(false);
      setPasswordStep(1);
      setPasswordData({ codigoVerificacion: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error('Error al cambiar contraseña', {
        description: error.message || 'El código es incorrecto o ha expirado'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Removed inline InputField definition

  return (
    <div style={{ minHeight: '100vh', background: C.bgSoft, fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* ── HERO HEADER ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
          padding: '40px 0',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '40px'
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <UserCircle style={{ width: 24, height: 24, color: C.white }} />
            </div>
            <h1 className="text-3xl sm:text-4xl" style={{ 
              fontFamily: "'Cormorant Garamond', serif", 
              fontWeight: 600, 
              color: C.white, 
              margin: 0 
            }}>
              Mi Perfil
            </h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '0 0 0 64px' }}>
            Gestiona tu información personal y preferencias
          </p>
        </div>
        
        {/* Decoración */}
        <div style={{ position: 'absolute', right: '5%', top: '-20%', fontSize: '150px', opacity: 0.05, transform: 'rotate(15deg)', pointerEvents: 'none' }}>
          ✿
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-20 max-w-5xl mx-auto">
        
        {/* Success Message */}
        {showSuccess && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            border: `1px solid ${C.success}`, 
            color: C.success, 
            borderRadius: '12px', 
            padding: '16px', 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
            <CheckCircle style={{ width: 20, height: 20 }} />
            <p style={{ fontSize: '14px', margin: 0, fontWeight: 500 }}>
              Tus cambios se han guardado exitosamente
            </p>
          </div>
        )}

        <div className="p-5 sm:p-10" style={{ background: C.white, borderRadius: '24px', border: `1px solid ${C.accent}`, boxShadow: `0 8px 30px ${C.shadowSm}` }}>
          
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 pb-8 mb-8" style={{ borderBottom: `1px solid ${C.accent}` }}>
            <div style={{ position: 'relative' }} className="group">
              <div style={{ 
                width: '96px', height: '96px', 
                borderRadius: '50%', 
                background: C.bgSoft, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                overflow: 'hidden', 
                border: `2px solid ${C.accentDark}` 
              }}>
                {isUploading ? (
                  <Loader2 style={{ width: 32, height: 32, color: C.accentDeep }} className="animate-spin" />
                ) : currentUser?.foto_perfil ? (
                  <img src={currentUser.foto_perfil} alt="PFP" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserCircle style={{ width: 64, height: 64, color: C.accentDeep, opacity: 0.5 }} />
                )}
              </div>
              <button 
                onClick={handleFileClick}
                disabled={isUploading || !isEditing}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: isEditing ? C.accentDeep : '#e5e7eb',
                  color: C.white, border: 'none', cursor: isEditing && !isUploading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 10px ${C.shadowSm}`,
                  transition: 'transform 0.2s'
                }}
              >
                <Camera style={{ width: 16, height: 16 }} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: C.textDark, margin: '0 0 8px 0' }}>
                {formData.nombres} {formData.apellidos}
              </h3>
              <button
                onClick={handleFileClick}
                disabled={isUploading || !isEditing}
                style={{
                  background: 'none',
                  border: `1px solid ${C.accentDark}`,
                  color: C.textDark,
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isEditing && !isUploading ? 'pointer' : 'not-allowed',
                  opacity: isEditing ? 1 : 0.5,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => { if(isEditing && !isUploading) e.currentTarget.style.background = C.bgSoft }}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                {isUploading ? 'Subiendo...' : 'Cambiar foto de perfil'}
              </button>
            </div>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField 
                label="Nombres" id="nombres" value={formData.nombres} 
                onChange={(e: any) => setFormData({ ...formData, nombres: e.target.value })} 
                disabled={!isEditing || isSaving} error={errors.nombres} 
              />
              <InputField 
                label="Apellidos" id="apellidos" value={formData.apellidos} 
                onChange={(e: any) => setFormData({ ...formData, apellidos: e.target.value })} 
                disabled={!isEditing || isSaving} error={errors.apellidos} 
              />
              <InputField 
                label="Email" id="email" type="email" value={formData.email} 
                onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} 
                disabled={!isEditing || isSaving} error={errors.email} placeholder="correo@ejemplo.com"
              />
              <InputField 
                label="Teléfono" id="telefono" value={formData.telefono} 
                onChange={(e: any) => setFormData({ ...formData, telefono: e.target.value })} 
                disabled={!isEditing || isSaving} error={errors.telefono} placeholder="3001234567"
              />
              <InputField 
                label="Ciudad" id="ciudad" value={formData.ciudad} 
                onChange={(e: any) => setFormData({ ...formData, ciudad: e.target.value })} 
                disabled={!isEditing || isSaving} error={errors.ciudad} placeholder="Medellín"
              />
            </div>

            <InputField 
              label="Dirección" id="direccion" value={formData.direccion} 
              onChange={(e: any) => setFormData({ ...formData, direccion: e.target.value })} 
              disabled={!isEditing || isSaving} error={errors.direccion} placeholder="Calle 31C #89-35"
            />

            {/* Preferences */}
            <div style={{ paddingTop: '24px', borderTop: `1px solid ${C.accent}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: C.textDark, margin: 0 }}>
                Preferencias
              </h3>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: isEditing ? 'pointer' : 'default', opacity: isEditing ? 1 : 0.6 }}>
                <input
                  type="checkbox"
                  checked={formData.recibirOfertas}
                  onChange={(e) => setFormData({ ...formData, recibirOfertas: e.target.checked })}
                  disabled={!isEditing || isSaving}
                  style={{ width: '18px', height: '18px', accentColor: C.accentDeep, cursor: isEditing ? 'pointer' : 'default' }}
                />
                <span style={{ fontSize: '14px', color: C.textDark }}>Recibir ofertas por email</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: isEditing ? 'pointer' : 'default', opacity: isEditing ? 1 : 0.6 }}>
                <input
                  type="checkbox"
                  checked={formData.notificacionesPush}
                  onChange={(e) => setFormData({ ...formData, notificacionesPush: e.target.checked })}
                  disabled={!isEditing || isSaving}
                  style={{ width: '18px', height: '18px', accentColor: C.accentDeep, cursor: isEditing ? 'pointer' : 'default' }}
                />
                <span style={{ fontSize: '14px', color: C.textDark }}>Notificaciones push</span>
              </label>
            </div>

            {/* Actions */}
            <div style={{ paddingTop: '32px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
                      color: C.white, border: 'none', padding: '14px 32px', borderRadius: '12px',
                      fontSize: '14px', fontWeight: 600, cursor: isSaving ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      boxShadow: `0 8px 20px ${C.shadowSm}`
                    }}
                  >
                    {isSaving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Save style={{ width: 16, height: 16 }} />}
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setErrors({});
                      if (currentUser) {
                        setFormData({
                          nombres: currentUser.nombres,
                          apellidos: currentUser.apellidos,
                          email: currentUser.email,
                          telefono: currentUser.telefono,
                          direccion: currentUser.direccion || '',
                          ciudad: currentUser.ciudad || '',
                          recibirOfertas: true,
                          notificacionesPush: false,
                        });
                      }
                    }}
                    disabled={isSaving}
                    style={{
                      background: 'none', color: C.textDark, border: `1px solid ${C.accentDark}`,
                      padding: '14px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                      cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <X style={{ width: 16, height: 16 }} />
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
                      color: C.white, border: 'none', padding: '14px 32px', borderRadius: '12px',
                      fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                      boxShadow: `0 8px 20px ${C.shadowSm}`
                    }}
                  >
                    Editar Perfil
                  </button>
                  <button
                    onClick={() => setIsPasswordDialogOpen(true)}
                    style={{
                      background: 'none', color: C.textDark, border: `1px solid ${C.accentDark}`,
                      padding: '14px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <Lock style={{ width: 16, height: 16 }} />
                    Cambiar contraseña
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={(open: boolean) => {
        if (!open && !isChangingPassword && !isSendingCode) {
          setIsPasswordDialogOpen(false);
          setPasswordStep(1);
          setPasswordData({ codigoVerificacion: '', newPassword: '', confirmPassword: '' });
          setPasswordErrors({});
        }
      }}>
        <DialogContent className="p-0 overflow-hidden shadow-2xl border-0" style={{ background: C.white, borderRadius: '24px', maxWidth: '450px', width: '95vw' }}>
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`, padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Lock style={{ width: 28, height: 28, color: C.white }} />
            </div>
            <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: C.white, margin: 0, fontWeight: 600 }}>Cambiar Contraseña</DialogTitle>
            <DialogDescription style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', marginTop: '6px' }}>
              {passwordStep === 1 ? 'Protege tu cuenta verificando tu identidad.' : 'Ingresa el código enviado y tu nueva contraseña segura.'}
            </DialogDescription>
          </div>

          <div style={{ padding: '24px 32px 32px', background: C.white }}>
            {passwordStep === 1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
                <p style={{ color: C.textDark, fontSize: '15px', lineHeight: '1.6' }}>
                  Para garantizar la seguridad de tu cuenta, te enviaremos un código de verificación de 6 dígitos a tu correo electrónico.
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                  <button
                    onClick={() => setIsPasswordDialogOpen(false)}
                    disabled={isSendingCode}
                    style={{
                      flex: 1,
                      background: 'none', color: C.textDark, border: `1px solid ${C.accentDark}`,
                      padding: '14px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.bgSoft}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSendCode}
                    disabled={isSendingCode}
                    style={{
                      flex: 1,
                      background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
                      color: C.white, border: 'none', padding: '14px 24px', borderRadius: '12px',
                      fontSize: '14px', fontWeight: 600, cursor: isSendingCode ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: `0 4px 12px ${C.shadowSm}`, transition: 'all 0.2s', opacity: isSendingCode ? 0.7 : 1
                    }}
                  >
                    {isSendingCode ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Mail style={{ width: 16, height: 16 }} />}
                    {isSendingCode ? 'Enviando...' : 'Enviar Código'}
                  </button>
                </div>
              </div>
            ) : passwordStep === 2 ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <p style={{ color: C.textDark, fontSize: '15px', lineHeight: '1.6', textAlign: 'center', marginBottom: '8px' }}>
                    Revisa tu bandeja de entrada e ingresa el código numérico.
                  </p>
                  <InputField 
                    label="Código de Verificación" id="codigoVerificacion" 
                    type="text" placeholder="Ej: 123456"
                    value={passwordData.codigoVerificacion} 
                    onChange={(e: any) => setPasswordData({ ...passwordData, codigoVerificacion: e.target.value.replace(/\D/g, '').slice(0, 6) })} 
                    disabled={isChangingPassword} error={passwordErrors.codigoVerificacion} 
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
                  <button
                    onClick={() => {
                      setPasswordStep(1);
                      setPasswordData({ codigoVerificacion: '', newPassword: '', confirmPassword: '' });
                      setPasswordErrors({});
                    }}
                    disabled={isChangingPassword}
                    style={{
                      flex: 1,
                      background: 'none', color: C.textDark, border: `1px solid ${C.accentDark}`,
                      padding: '14px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.bgSoft}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    Atrás
                  </button>
                  <button
                    onClick={() => {
                      if (!passwordData.codigoVerificacion || passwordData.codigoVerificacion.length !== 6) {
                        setPasswordErrors({ codigoVerificacion: 'El código debe tener 6 dígitos' });
                      } else {
                        setPasswordErrors({});
                        setPasswordStep(3);
                      }
                    }}
                    disabled={isChangingPassword}
                    style={{
                      flex: 1,
                      background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
                      color: C.white, border: 'none', padding: '14px 24px', borderRadius: '12px',
                      fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: `0 4px 12px ${C.shadowSm}`, transition: 'all 0.2s'
                    }}
                  >
                    Continuar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ position: 'relative' }}>
                    <InputField 
                      label="Nueva Contraseña" id="newPassword" 
                      type={showNewPassword ? "text" : "password"} 
                      value={passwordData.newPassword} 
                      onChange={(e: any) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                      disabled={isChangingPassword} error={passwordErrors.newPassword} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ position: 'absolute', right: '16px', top: '24px', background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, height: '44px', display: 'flex', alignItems: 'center' }}
                    >
                      {showNewPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                    </button>
                  </div>
                  
                  {/* Checklist */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '-8px', marginBottom: '4px' }}>
                    {[
                      { met: passwordData.newPassword.length >= 8, text: 'Mínimo 8 caracteres' },
                      { met: /[A-Z]/.test(passwordData.newPassword), text: 'Al menos una mayúscula' },
                      { met: /[a-z]/.test(passwordData.newPassword), text: 'Al menos una minúscula' },
                      { met: /\W/.test(passwordData.newPassword), text: 'Carácter especial' }
                    ].map((req, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: req.met ? C.success : C.textMuted, fontSize: '12px', transition: 'all 0.3s' }}>
                        {req.met ? <Check style={{ width: 12, height: 12 }} /> : <div style={{ width: 12, height: 12, borderRadius: '50%', border: `1.5px solid ${C.textMuted}`, opacity: 0.4 }} />}
                        <span style={{ fontWeight: req.met ? 600 : 400 }}>{req.text}</span>
                      </div>
                    ))}
                  </div>

                  <InputField 
                    label="Confirmar Nueva Contraseña" id="confirmPassword" 
                    type="password" value={passwordData.confirmPassword} 
                    onChange={(e: any) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                    disabled={isChangingPassword} error={passwordErrors.confirmPassword} 
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
                  <button
                    onClick={() => {
                      setPasswordStep(2);
                      setPasswordErrors({});
                    }}
                    disabled={isChangingPassword}
                    style={{
                      flex: 1,
                      background: 'none', color: C.textDark, border: `1px solid ${C.accentDark}`,
                      padding: '14px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.bgSoft}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    style={{
                      flex: 1,
                      background: `linear-gradient(135deg, ${C.textDark} 0%, ${C.accentDeep} 100%)`,
                      color: C.white, border: 'none', padding: '14px 24px', borderRadius: '12px',
                      fontSize: '14px', fontWeight: 600, cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: `0 4px 12px ${C.shadowSm}`, transition: 'all 0.2s', opacity: isChangingPassword ? 0.7 : 1
                    }}
                  >
                    {isChangingPassword ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <Lock style={{ width: 16, height: 16 }} />}
                    {isChangingPassword ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
