import { Search, Loader2, ShieldCheck } from "lucide-react";
import { Pagination } from "../../Pagination";
import { useState, useEffect } from "react";
import { getPermisosPaginatedAPI } from "../../../services/roleService";

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
      // Use the paginated endpoint
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
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-12">
      <div className="p-6 border-b border-gray-100 bg-[#fafafa]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Catálogo de Permisos</h3>
            <p className="text-sm text-gray-500">
              Visualiza y busca todos los permisos registrados en el sistema.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 h-11 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="text-left py-4 px-6 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                ID
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Nombre
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Descripción
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Módulo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-400 font-medium">Buscando permisos...</p>
                </td>
              </tr>
            ) : permisos.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center">
                  <ShieldCheck className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No se encontraron coincidencias.</p>
                </td>
              </tr>
            ) : (
              permisos.map((p) => (
                <tr
                  key={p.id_permiso}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900">
                      {p.id_permiso}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                      {p.nombre}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600 line-clamp-1">
                      {p.descripcion}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600 capitalize">
                      {p.modulo}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {permisos.length > 0 && totalPages > 1 && (
        <div className="p-4 border-t border-gray-100">
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
