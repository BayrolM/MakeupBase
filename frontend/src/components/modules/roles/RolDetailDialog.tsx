import { useState } from 'react';
import { 
  Shield, X, Users as UsersIcon, CheckCircle2, XCircle, 
  Activity, Calendar, Info, LayoutDashboard, ShoppingBag, 
  Package, Users, Truck, Settings, ArrowLeftRight, Tags
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Badge } from "../../ui/badge";
import { MODULOS } from '../../../utils/rolUtils';

interface RolDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rol: any;
  users: any[];
}

export function RolDetailDialog({
  open,
  onOpenChange,
  rol,
  users
}: RolDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("general");

  if (!rol) return null;

  const usersForRole = users.filter(u => u.rolAsignadoId === rol.id);

  // Agrupación lógica de módulos para mejor lectura
  const GRUPOS_PERMISOS = [
    {
      titulo: "Operaciones y Ventas",
      icon: <ShoppingBag className="w-4 h-4" />,
      modulos: ['ventas', 'compras', 'devoluciones']
    },
    {
      titulo: "Catálogo e Inventario",
      icon: <Package className="w-4 h-4" />,
      modulos: ['productos', 'categorias']
    },
    {
      titulo: "Relaciones y Terceros",
      icon: <Users className="w-4 h-4" />,
      modulos: ['clientes', 'proveedores']
    },
    {
      titulo: "Administración y Sistema",
      icon: <Settings className="w-4 h-4" />,
      modulos: ['dashboard', 'usuarios', 'configuracion']
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-0 max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl p-0 flex flex-col">
        {/* Encabezado Principal */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center text-white font-bold text-xl flex-shrink-0 luxury-icon-gradient"
                style={{ width: 48, height: 48, borderRadius: 14 }}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">
                  {rol.nombre}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={`text-[10px] uppercase px-2 py-0.5 border-0 ${rol.estado === 'activo' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {rol.estado === 'activo' ? 'Habilitado' : 'Deshabilitado'}
                  </Badge>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <UsersIcon className="w-3 h-3" /> {usersForRole.length} usuarios vinculados
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-gray-50/50 p-1 rounded-xl w-full sm:w-auto border border-gray-100">
              <TabsTrigger value="general" className="rounded-lg text-xs font-bold px-6 data-[state=active]:bg-white data-[state=active]:text-[#c47b96] data-[state=active]:shadow-sm">
                Información
              </TabsTrigger>
              <TabsTrigger value="permisos" className="rounded-lg text-xs font-bold px-6 data-[state=active]:bg-white data-[state=active]:text-[#c47b96] data-[state=active]:shadow-sm">
                Privilegios
              </TabsTrigger>
              <TabsTrigger value="usuarios" className="rounded-lg text-xs font-bold px-6 data-[state=active]:bg-white data-[state=active]:text-[#c47b96] data-[state=active]:shadow-sm">
                Personas ({usersForRole.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Contenido Desplazable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <Tabs value={activeTab}>
            <TabsContent value="general" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-[#fff8fb] border border-[#f0d5e0]/50 rounded-2xl p-6">
                    <h3 className="text-xs font-bold text-[#c47b96] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5" /> Descripción del Rol
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      "{rol.descripcion || 'Este rol no cuenta con una descripción detallada registrada.'}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all hover:bg-white hover:shadow-sm">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Creado el</p>
                        <p className="text-sm font-bold text-gray-800">
                          {rol.created_at ? new Date(rol.created_at).toLocaleString('es-CO', { dateStyle: 'long' }) : 'Fecha no registrada'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all hover:bg-white hover:shadow-sm">
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Estado Actual</p>
                        <p className={`text-sm font-bold ${rol.estado === 'activo' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {rol.estado === 'activo' ? 'Operativo / Habilitado' : 'Suspendido / Inactivo'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center border border-gray-100">
                  <div className="w-20 h-20 rounded-full bg-white shadow-xl border-4 border-[#fff0f5] flex items-center justify-center mb-6">
                    <UsersIcon className="w-10 h-10 text-[#c47b96]" />
                  </div>
                  <h4 className="text-3xl font-black text-gray-900">{usersForRole.length}</h4>
                  <p className="text-sm text-gray-500 font-medium mb-4">Usuarios bajo este perfil</p>
                  <p className="text-xs text-gray-400 max-w-[200px]">Este rol tiene impacto directo sobre las acciones de {usersForRole.length} colaboradores en el sistema.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permisos" className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {GRUPOS_PERMISOS.map((grupo, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-[#fff0f5] text-[#c47b96] flex items-center justify-center">
                      {grupo.icon}
                    </div>
                    <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">{grupo.titulo}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {MODULOS.filter(m => grupo.modulos.includes(m.key)).map((m) => {
                      const p = rol.permisos[m.key];
                      return (
                        <div key={m.key} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between transition-all hover:shadow-md hover:border-[#c47b96]/20 group">
                          <span className="text-sm font-bold text-gray-700 group-hover:text-[#c47b96] transition-colors">{m.label}</span>
                          <div className="flex items-center gap-6">
                            {(['ver', 'crear', 'editar', 'eliminar'] as const).map(t => (
                              <div key={t} className="flex flex-col items-center gap-1.5 min-w-[40px]">
                                <span className="text-[9px] uppercase font-bold text-gray-300 tracking-tighter">{t.slice(0, 3)}</span>
                                {p?.[t]
                                  ? <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shadow-sm"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /></div>
                                  : <div className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center opacity-30"><XCircle className="w-3.5 h-3.5 text-gray-300" /></div>
                                }
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="usuarios" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {usersForRole.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-200 border border-dashed border-gray-200">
                    <UsersIcon className="w-10 h-10" />
                  </div>
                  <p className="text-gray-400 font-medium italic">No se han encontrado usuarios asignados a este rol.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {usersForRole.map((u) => (
                    <div key={u.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 transition-all hover:shadow-lg hover:border-[#c47b96]/20 group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#fff0f5] -mr-8 -mt-8 rounded-full opacity-30 group-hover:scale-110 transition-transform" />
                      <div className="w-12 h-12 rounded-xl bg-[#fff0f5] flex items-center justify-center text-[#c47b96] font-black text-lg relative z-10">
                        {u.nombres.charAt(0)}
                      </div>
                      <div className="relative z-10">
                        <p className="text-sm font-bold text-gray-800 leading-tight">{u.nombres} {u.apellidos}</p>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5">{u.email}</p>
                        <Badge variant="outline" className="mt-2 text-[9px] h-4 px-1.5 border-gray-100 text-gray-400 bg-gray-50/50">
                          {u.telefono}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-xl text-white font-bold text-sm luxury-button-modal shadow-lg shadow-[#c47b96]/20 active:scale-[0.98] transition-transform"
          >
            Finalizar Consulta
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
