import { useState, useEffect } from 'react';
import { useStore, Producto } from '../../lib/store';
import { PageHeader } from '../PageHeader';
import { StatusSwitch } from '../StatusSwitch';
import { Pagination } from '../Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Plus, Pencil, Trash2, Eye, Search, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '../../services/productService';

export function ProductsModule() {
  const { productos, categorias, setProductos, currentUser } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    sku: '',
    nombre: '',
    descripcion: '',
    categoriaId: '',
    marca: '',
    precioCompra: '',
    precioVenta: '',
    stock: '',
    stockMinimo: '',
    stockMaximo: '',
    imagenUrl: '',
    estado: 'activo' as 'activo' | 'inactivo',
  });

  // Load products on mount
  useEffect(() => {
    refreshProductsLocal();
  }, []);

  // Check if current user is admin
  const isAdmin = currentUser?.rol === 'admin';

  // Helper to map backend to frontend
  const refreshProductsLocal = async () => {
    try {
      const resp = await productService.getAll({ limit: 100 });
      const mapped = resp.data.map(prod => ({
        id: prod.id_producto.toString(),
        sku: prod.sku,
        nombre: prod.nombre,
        descripcion: prod.descripcion || '',
        categoriaId: prod.id_categoria.toString(),
        marca: (prod as any).nombre_marca || 'Genérica',
        precioCompra: Number(prod.costo_promedio) || 0,
        precioVenta: Number(prod.precio_venta) || 0,
        stock: prod.stock_actual || 0,
        stockMinimo: prod.stock_min || 0,
        stockMaximo: prod.stock_max || 100,
        imagenUrl: prod.imagen_url || '',
        estado: prod.estado ? 'activo' as const : 'inactivo' as const,
        fechaCreacion: new Date().toISOString(),
      }));
      setProductos(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenDialog = (product?: Producto) => {
    if (!isAdmin) {
      toast.error('Acceso denegado', {
        description: 'Solo los administradores pueden crear o editar productos.',
      });
      return;
    }

    if (product) {
      setEditingProduct(product);
      setFormData({
        sku: product.sku,
        nombre: product.nombre,
        descripcion: product.descripcion,
        categoriaId: product.categoriaId,
        marca: product.marca,
        precioCompra: product.precioCompra.toString(),
        precioVenta: product.precioVenta.toString(),
        stock: product.stock.toString(),
        stockMinimo: product.stockMinimo.toString(),
        stockMaximo: product.stockMaximo.toString(),
        imagenUrl: product.imagenUrl || '',
        estado: product.estado,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        sku: '',
        nombre: '',
        descripcion: '',
        categoriaId: categorias[0]?.id || '',
        marca: '',
        precioCompra: '0',
        precioVenta: '0',
        stock: '0',
        stockMinimo: '0',
        stockMaximo: '100',
        imagenUrl: '',
        estado: 'activo',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.sku.trim() || !formData.nombre.trim() || !formData.categoriaId) {
      toast.error('Faltan campos obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        sku: formData.sku,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        id_categoria: Number(formData.categoriaId),
        id_marca: 1, // Temporarily default to 1
        precio_venta: Number(formData.precioVenta),
        costo_promedio: Number(formData.precioCompra),
        stock_actual: Number(formData.stock),
        stock_min: Number(formData.stockMinimo),
        stock_max: Number(formData.stockMaximo),
        imagen_url: formData.imagenUrl,
        estado: formData.estado === 'activo',
      };

      if (editingProduct) {
        await productService.update(Number(editingProduct.id), payload);
        toast.success('Producto actualizado');
      } else {
        await productService.create(payload);
        toast.success('Producto creado');
      }
      
      await refreshProductsLocal();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      await productService.delete(Number(selectedProduct.id));
      await refreshProductsLocal();
      toast.success('Producto eliminado');
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStockStatus = (product: Producto) => {
    if (product.stock <= product.stockMinimo) {
      return { type: 'low', color: 'text-[#FFA500]', bgColor: 'bg-[#FFA500]/10', borderColor: 'border-[#FFA500]/30', label: 'BAJO', message: 'El producto está llegando al stock mínimo.' };
    } else if (product.stock >= product.stockMaximo) {
      return { type: 'high', color: 'text-[#FF8C00]', bgColor: 'bg-[#FF8C00]/10', borderColor: 'border-[#FF8C00]/30', label: 'MÁXIMO', message: 'El producto ha alcanzado su límite máximo de stock.' };
    }
    return null;
  };

  const sortedProducts = [...productos].sort((a, b) => b.id.localeCompare(a.id));
  
  const filteredProducts = sortedProducts.filter(product => {
    if (!searchQuery || searchQuery.length < 2) return true;
    const query = searchQuery.toLowerCase();
    const catName = categorias.find(c => c.id === product.categoriaId)?.nombre || '';
    return product.sku.toLowerCase().includes(query) || 
           product.nombre.toLowerCase().includes(query) || 
           product.marca.toLowerCase().includes(query) ||
           catName.toLowerCase().includes(query);
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Productos"
        subtitle="Gestión del catálogo de productos"
        actionButton={{
          label: 'Nuevo Producto',
          icon: Plus,
          onClick: () => handleOpenDialog(),
          disabled: !isAdmin,
        }}
      />

      <div className="p-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-secondary" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-10 bg-input-background border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Buscar por SKU, nombre, marca o categoría..."
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-foreground-secondary text-sm">
              Mostrando {filteredProducts.length} de {productos.length} productos
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio Venta</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id} className="border-border">
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    <span>{product.nombre}</span>
                  </TableCell>
                  <TableCell>{product.marca}</TableCell>
                  <TableCell>{categorias.find(c => c.id === product.categoriaId)?.nombre || 'Sin cat.'}</TableCell>
                  <TableCell>{formatCurrency(product.precioVenta)}</TableCell>
                  <TableCell>
                    <span className={getStockStatus(product)?.color || 'text-foreground'}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusSwitch 
                      status={product.estado} 
                      onChange={(newStatus: 'activo' | 'inactivo') => {
                        if (!isAdmin) return;
                        productService.update(Number(product.id), { estado: newStatus === 'activo' }).then(refreshProductsLocal);
                      }}
                      disabled={!isAdmin}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedProduct(product); setIsDetailDialogOpen(true); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled={!isAdmin} onClick={() => handleOpenDialog(product)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled={!isAdmin} className="text-danger" onClick={() => { setSelectedProduct(product); setIsDeleteDialogOpen(true); }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="p-4 border-t border-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dialogo de Creación/Edición */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={formData.categoriaId} onValueChange={(v: string) => setFormData({...formData, categoriaId: v})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {categorias.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Precio Venta</Label>
              <Input type="number" value={formData.precioVenta} onChange={e => setFormData({...formData, precioVenta: e.target.value})} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Descripción (Opcional)</Label>
              <Textarea 
                value={formData.descripcion} 
                onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                placeholder="Escribe una breve descripción del producto..."
                className="bg-input-background border-border text-foreground"
                rows={3}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>URL de la Imagen</Label>
              <Input value={formData.imagenUrl} onChange={e => setFormData({...formData, imagenUrl: e.target.value})} placeholder="https://ejemplo.com/imagen.jpg" />
              {formData.imagenUrl && (
                <div className="mt-2 w-20 h-20 rounded-lg border border-border overflow-hidden">
                  <img src={formData.imagenUrl} alt="Vista previa" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo de Detalles */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Detalles del Producto</DialogTitle></DialogHeader>
          {selectedProduct && (
            <div className="space-y-6 py-4">
              <div className="flex justify-center">
                {selectedProduct.imagenUrl ? (
                  <div className="w-48 h-48 rounded-xl border border-border overflow-hidden shadow-sm">
                    <img 
                      src={selectedProduct.imagenUrl} 
                      alt={selectedProduct.nombre} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-xl bg-surface border border-border flex flex-col items-center justify-center text-foreground-secondary gap-2">
                    <AlertTriangle className="w-8 h-8 opacity-20" />
                    <span className="text-sm">Sin imagen disponible</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider">SKU</p>
                  <p className="text-foreground font-semibold">{selectedProduct.sku}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider">Nombre</p>
                  <p className="text-foreground font-semibold">{selectedProduct.nombre}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider">Precio de Venta</p>
                  <p className="text-primary text-lg font-bold">{formatCurrency(selectedProduct.precioVenta)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider">Stock Actual</p>
                  <p className={`font-bold ${getStockStatus(selectedProduct)?.color || 'text-foreground'}`}>
                    {selectedProduct.stock} unidades
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider">Descripción</p>
                <div className="bg-surface/50 p-4 rounded-lg border border-border/50">
                  <p className="text-foreground-secondary leading-relaxed">
                    {selectedProduct.descripcion || 'Este producto no cuenta con una descripción detallada todavía.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={() => setIsDetailDialogOpen(false)}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo de Eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Eliminar Producto</DialogTitle></DialogHeader>
          <p className="py-4 text-center">¿Seguro que deseas eliminar <strong>{selectedProduct?.nombre}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-danger text-foreground" onClick={handleConfirmDelete}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
