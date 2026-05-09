import {
  Search,
  Loader2,
  ShieldCheck,
  Hash,
  FileText,
  LayoutGrid,
  X,
} from "lucide-react";
import { Pagination } from "../../Pagination";
import { useState, useEffect } from "react";
import { getPermisosPaginatedAPI } from "../../../services/roleService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";

interface Permiso {
  id_permiso: number;
  nombre: string;
  descripcion: string;
  modulo: string;
}

export function PermisosTable() {
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchPermisos = async () => {
    setIsLoading(true);
    try {
      const res = await getPermisosPaginatedAPI({
        page: currentPage,
        limit: itemsPerPage,
        q: debouncedSearch,
      });
      setPermisos(res.data || []);
      setTotalItems(res.total || 0);
    } catch (err) {
      console.error("Error cargando permisos", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermisos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, debouncedSearch]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl overflow-hidden shadow-xl mx-8 mb-8">
      {/* Buscador Superior */}
      <div className="p-4 border-b border-gray-100 bg-white space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 pl-10 pr-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#c47b96] focus:ring-2 focus:ring-[#c47b96]/20 transition-all duration-150 shadow-sm"
              placeholder="Buscar por nombre, descripción o módulo..."
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-[#fff0f5] border-b-2 border-[#fce8f0]">
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 pl-6">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> ID
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Nombre
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Descripción
              </div>
            </TableHead>
            <TableHead className="text-gray-700 font-semibold text-xs uppercase tracking-wider py-3 pr-6">
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5" /> Módulo
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="py-20 text-center bg-white">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#c47b96]" />
                  <p className="text-sm text-gray-400 font-medium tracking-wide">
                    Consultando catálogo...
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : permisos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-20 text-center bg-white">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#fff0f5] to-[#fce8f0] flex items-center justify-center">
                    <ShieldCheck className="w-10 h-10 text-[#c47b96]" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-semibold text-lg">
                      {searchQuery
                        ? `No se encontraron resultados para "${searchQuery}"`
                        : "No hay permisos registrados"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1 italic">
                      Intenta ajustar tus criterios de búsqueda.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            permisos.map((p) => (
              <TableRow
                key={p.id_permiso}
                className="border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fff0f5]/40 hover:to-transparent group bg-white"
              >
                <TableCell className="py-3 pl-6">
                  <span className="font-mono text-[11px] font-semibold text-gray-500 group-hover:text-[#c47b96]">
                    {p.id_permiso}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-[#fff0f5] text-[#c47b96] border border-[#fce8f0]">
                    {p.nombre}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <span className="text-gray-600 text-sm font-medium line-clamp-1 max-w-md">
                    {p.descripcion}
                  </span>
                </TableCell>
                <TableCell className="py-3 pr-6">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-400 border border-gray-100 group-hover:bg-white group-hover:text-[#c47b96] group-hover:border-[#fce8f0] transition-all">
                    {p.modulo}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalItems > 0 && (
        <div className="px-6 py-4 bg-white border-t border-gray-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(n) => {
              setItemsPerPage(n);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
