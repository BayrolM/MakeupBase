import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserRole } from '../../lib/store';
import { ChevronLeft, User, Hash, Mail, Phone, Lock, MapPin, Building2, CreditCard, Eye, EyeOff } from 'lucide-react';

interface RegisterPageProps {
  onRegister: (data: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    password: string;
    rol: UserRole;
    tipoDocumento: string;
    documento: string;
    direccion: string;
    ciudad: string;
  }) => void;
  onNavigateToLogin: () => void;
  onBack?: () => void;
}

export function RegisterPageColombia({ onRegister, onNavigateToLogin, onBack }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    tipoDocumento: 'CC',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'nombres':
      case 'apellidos': {
        const label = name === 'nombres' ? 'El nombre' : 'El apellido';
        if (!value.trim()) return `${label} es obligatorio`;
        if (value.trim().length > 80) return `Máximo 80 caracteres`;
        return '';
      }
      case 'numeroDocumento':
        if (!value.trim()) return 'El documento es obligatorio';
        if (value.trim().length > 10) return 'Máximo 10 caracteres';
        return '';
      case 'email':
        if (!value.trim()) return 'El email es obligatorio';
        if (!emailRegex.test(value.trim())) return 'Formato inválido';
        if (value.trim().length > 100) return 'Máximo 100 caracteres';
        return '';
      case 'telefono':
        if (!value.trim()) return 'El teléfono es obligatorio';
        if (!/^\d+$/.test(value.trim())) return 'Solo números';
        if (value.trim().length < 7) return 'Mínimo 7 dígitos';
        if (value.trim().length > 15) return 'Máximo 15 dígitos';
        return '';
      case 'password':
        if (!value) return 'La contraseña es obligatoria';
        if (value.length < 8) return 'Mínimo 8 caracteres';
        return '';
      case 'confirmPassword':
        if (!value) return 'Confirma tu contraseña';
        if (value !== formData.password) return 'Las contraseñas no coinciden';
        return '';
      case 'direccion':
        if (value.trim() && value.trim().length < 3) return 'Mínimo 3 caracteres';
        if (value.trim().length > 30) return 'Máximo 30 caracteres';
        return '';
      case 'ciudad':
        if (value.trim().length > 50) return 'Máximo 50 caracteres';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    if (name === 'password' && formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: value !== formData.confirmPassword ? 'Las contraseñas no coinciden' : '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fields = ['nombres', 'apellidos', 'numeroDocumento', 'email', 'telefono', 'password', 'confirmPassword', 'direccion', 'ciudad'];
    const newErrors: Record<string, string> = {};
    fields.forEach(f => {
      const err = validateField(f, (formData as any)[f] || '');
      if (err) newErrors[f] = err;
    });
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    onRegister({
      nombre: formData.nombres.trim(),
      apellido: formData.apellidos.trim(),
      email: formData.email.trim(),
      telefono: formData.telefono.trim(),
      password: formData.password,
      rol: 'cliente',
      tipoDocumento: formData.tipoDocumento,
      documento: formData.numeroDocumento.trim(),
      direccion: formData.direccion.trim(),
      ciudad: formData.ciudad.trim(),
    });
    setIsLoading(false);
  };

  const field = (name: string) => ({
    value: (formData as any)[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(name, e.target.value),
    className: `h-11 w-full rounded-xl border text-sm text-gray-800 bg-white placeholder:text-gray-400 px-4 transition-all outline-none focus:ring-2 ${
      errors[name]
        ? 'border-rose-400 focus:ring-rose-200'
        : 'border-gray-200 focus:border-[#7b1347] focus:ring-[#7b1347]/15'
    }`,
  });

  return (
    <div className="min-h-screen flex" style={{ background: '#f6f3f5' }}>

      {/* ── Panel izquierdo decorativo ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 px-10 py-10"
        style={{
          background: `
            radial-gradient(ellipse at 80% 10%, rgba(196,123,150,0.45) 0%, transparent 55%),
            radial-gradient(ellipse at 10% 80%, rgba(80,25,40,0.6) 0%, transparent 55%),
            linear-gradient(158deg, #1a0a12 0%, #2e1020 40%, #4a2035 100%)
          `,
        }}
      >
        {/* Logo */}
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-10"
            >
              <ChevronLeft className="w-4 h-4" />
              Volver al inicio
            </button>
          )}
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 mb-6">
            <img src="/logo.png" alt="Glamour ML" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Bienvenida a<br />Glamour ML
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Crea tu cuenta y descubre nuestra colección de productos de belleza y cuidado personal.
          </p>
        </div>

        {/* Decoración inferior */}
        <div className="space-y-3">
          {['Catálogo exclusivo de productos', 'Seguimiento de tus pedidos', 'Ofertas y descuentos especiales'].map(item => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(196,123,150,0.3)' }}>
                <div className="w-2 h-2 rounded-full bg-[#c47b96]" />
              </div>
              <span className="text-white/70 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div className="flex-1 overflow-y-auto flex flex-col">

        {/* Header móvil */}
        <div className="lg:hidden flex items-center justify-between px-6 pt-6 pb-4">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1.5 text-gray-500 hover:text-[#7b1347] text-sm font-medium transition-colors">
              <ChevronLeft className="w-4 h-4" /> Volver
            </button>
          )}
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow border border-gray-200">
            <img src="/logo.png" alt="Glamour ML" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 lg:px-14 py-8 max-w-xl w-full mx-auto lg:mx-0">

          {/* Título */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
            <p className="text-gray-500 text-sm mt-1">Completa tus datos para registrarte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Identificación */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Identificación</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#7b1347]" /> Tipo Doc. <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={formData.tipoDocumento} onValueChange={v => setFormData(p => ({ ...p, tipoDocumento: v }))}>
                    <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-white text-gray-800 text-sm focus:border-[#7b1347] focus:ring-[#7b1347]/15">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                      <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                      <SelectItem value="PAS">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#7b1347]" /> Número <span className="text-rose-500">*</span>
                  </Label>
                  <input {...field('numeroDocumento')} placeholder="1234567890" maxLength={10} />
                  {errors.numeroDocumento && <p className="text-rose-500 text-xs">{errors.numeroDocumento}</p>}
                </div>
              </div>
            </div>

            {/* Datos personales */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Datos Personales</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#7b1347]" /> Nombre <span className="text-rose-500">*</span>
                  </Label>
                  <input {...field('nombres')} placeholder="Juan" maxLength={80} />
                  {errors.nombres && <p className="text-rose-500 text-xs">{errors.nombres}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#7b1347]" /> Apellido <span className="text-rose-500">*</span>
                  </Label>
                  <input {...field('apellidos')} placeholder="Pérez" maxLength={80} />
                  {errors.apellidos && <p className="text-rose-500 text-xs">{errors.apellidos}</p>}
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contacto</p>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#7b1347]" /> Email <span className="text-rose-500">*</span>
                </Label>
                <input {...field('email')} type="email" placeholder="correo@ejemplo.com" maxLength={100} />
                {errors.email && <p className="text-rose-500 text-xs">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#7b1347]" /> Teléfono <span className="text-rose-500">*</span>
                </Label>
                <input {...field('telefono')} placeholder="3001234567" maxLength={15} />
                {errors.telefono && <p className="text-rose-500 text-xs">{errors.telefono}</p>}
              </div>
            </div>

            {/* Residencia */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Residencia</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#7b1347]" /> Ciudad
                  </Label>
                  <input {...field('ciudad')} placeholder="Medellín" maxLength={50} />
                  {errors.ciudad && <p className="text-rose-500 text-xs">{errors.ciudad}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7b1347]" /> Dirección
                  </Label>
                  <input {...field('direccion')} placeholder="Cra 80 #25-35" maxLength={30} />
                  {errors.direccion && <p className="text-rose-500 text-xs">{errors.direccion}</p>}
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Seguridad</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#7b1347]" /> Contraseña <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={e => handleChange('password', e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      maxLength={225}
                      className={`h-11 w-full rounded-xl border text-sm text-gray-800 bg-white placeholder:text-gray-400 px-4 pr-10 transition-all outline-none focus:ring-2 ${errors.password ? 'border-rose-400 focus:ring-rose-200' : 'border-gray-200 focus:border-[#7b1347] focus:ring-[#7b1347]/15'}`}
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-rose-500 text-xs">{errors.password}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#7b1347]" /> Confirmar <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={e => handleChange('confirmPassword', e.target.value)}
                      placeholder="Repite tu contraseña"
                      maxLength={225}
                      className={`h-11 w-full rounded-xl border text-sm text-gray-800 bg-white placeholder:text-gray-400 px-4 pr-10 transition-all outline-none focus:ring-2 ${errors.confirmPassword ? 'border-rose-400 focus:ring-rose-200' : 'border-gray-200 focus:border-[#7b1347] focus:ring-[#7b1347]/15'}`}
                    />
                    <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-rose-500 text-xs">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg, #2e1020 0%, #7b1347 60%, #c47b96 100%)' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registrando...
                </span>
              ) : 'Crear mi cuenta'}
            </button>

            <p className="text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={onNavigateToLogin} className="font-semibold hover:opacity-80 transition-opacity" style={{ color: '#7b1347' }}>
                Ingresar
              </button>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
