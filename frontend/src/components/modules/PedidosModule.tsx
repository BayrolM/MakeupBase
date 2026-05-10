import { useState, useEffect } from "react";
import {
  useStore,
  OrderStatus,
  Cliente,
  Producto,
  Status,
} from "../../lib/store";
import { toast } from "sonner";
import { generateOrderPDF } from "../../lib/pdfGenerator";
import { orderService } from "../../services/orderService";
import { userService } from "../../services/userService";
import { productService } from "../../services/productService";
import { CONFIG } from "../../lib/constants";
import { usePagination } from "../../hooks/usePagination";
import { Pagination } from "../Pagination";

// Sub-componentes
import { PedidoHeader } from "./pedidos/PedidoHeader";
import { PedidoTable } from "./pedidos/PedidoTable";
import { PedidoFormDialog } from "./pedidos/PedidoFormDialog";
import { PedidoEditDialog } from "./pedidos/PedidoEditDialog";
import { PedidoStatusDialog } from "./pedidos/PedidoStatusDialog";
import { PedidoDetailDialog } from "./pedidos/PedidoDetailDialog";
import { PedidoShippingDialog } from "./pedidos/PedidoShippingDialog";
import { PedidoPaymentConfirmDialog } from "./pedidos/PedidoPaymentConfirmDialog";
import { PedidoPreviewDialog } from "./pedidos/PedidoPreviewDialog";

// Utils
import { getTrackingUrl } from "../../utils/pedidoUtils";

export function PedidosModule() {
  const {
    currentUser,
    pedidos,
    clientes,
    productos,
    setPedidos,
    setClientes,
    setProductos,
  } = useStore();

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Data States
  const [editingPedido, setEditingPedido] = useState<any>(null);
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [pedidoToConfirm, setPedidoToConfirm] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pendiente");
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  const {
    currentPage,
    itemsPerPage,
    totalPages,
    handlePageChange,
    handleLimitChange,
  } = usePagination({ totalItems });

  // Form States
  const [formData, setFormData] = useState({
    clienteId: "",
    direccionEnvio: "",
    ciudad: "",
    departamento: "",
    productos: [
      { productoId: "", cantidad: 1, precioUnitario: 0, maxStock: 0 },
    ],
    metodo_pago: "transferencia",
  });
  const [editFormData, setEditFormData] = useState({
    clienteId: "",
    direccionEnvio: "",
    ciudad: "",
    departamento: "",
    productos: [] as {
      productoId: string;
      cantidad: number;
      precioUnitario: number;
      maxStock: number;
    }[],
  });
  const [shippingFormData, setShippingFormData] = useState({
    transportadora: "Servientrega",
    numero_guia: "",
    fecha_envio: new Date().toISOString().split("T")[0],
    fecha_estimada: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    refreshDependencies();
  }, []);

  useEffect(() => {
    refreshPedidos();
  }, [currentPage, itemsPerPage, debouncedSearchQuery]);

  const refreshDependencies = async () => {
    try {
      const [uRes, pRes] = await Promise.all([
        userService.getAll({ id_rol: 2, limit: 100 }),
        productService.getAll({ limit: 100 }),
      ]);

      const mappedClientes: Cliente[] = (uRes.data || []).map((u: any) => ({
        id: u.id_usuario.toString(),
        nombre:
          `${u.nombres || ""} ${u.apellidos || ""}`.trim() || "Sin Nombre",
        nombres: u.nombres || "",
        apellidos: u.apellidos || "",
        email: u.email || "",
        telefono: u.telefono || "",
        documento: u.documento || "",
        numeroDocumento: u.documento || "",
        estado: (u.estado ? "activo" : "inactivo") as Status,
        totalCompras: Number(u.total_ventas) || 0,
        fechaRegistro: u.fecha_registro || new Date().toISOString(),
        direccion: u.direccion || "",
        ciudad: u.ciudad || "",
        departamento: u.departamento || "",
      }));
      setClientes(mappedClientes);

      const mappedProductos: Producto[] = pRes.data.map((p: any) => ({
        id: p.id_producto.toString(),
        nombre: p.nombre,
        descripcion: p.descripcion || "",
        categoriaId: p.id_categoria?.toString() || "1",
        marca: p.marca || "",
        precioCompra: Number(p.precio_compra) || 0,
        precioVenta: Number(p.precio_venta) || 0,
        stock: Number(p.stock_actual) || 0,
        stockMinimo: Number(p.stock_min) || 0,
        stockMaximo: Number(p.stock_max) || 100,
        stockFisico: Number(p.stock_actual) || 0,
        imagenUrl: p.imagen_url || "",
        estado: (p.estado ? "activo" : "inactivo") as Status,
        fechaCreacion: p.fecha_creacion || new Date().toISOString(),
      }));
      setProductos(mappedProductos);
    } catch (error) {
      toast.error("Error al cargar dependencias");
    }
  };

  const refreshPedidos = async () => {
    try {
      const ESTADOS_VALIDOS = [
        "pendiente",
        "preparado",
        "procesando",
        "enviado",
        "entregado",
        "cancelado",
      ];
      const qLower = debouncedSearchQuery.toLowerCase().trim();
      const esEstado = ESTADOS_VALIDOS.includes(qLower);

      const response = await orderService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        q: esEstado ? undefined : debouncedSearchQuery || undefined,
        estado: esEstado ? qLower : undefined,
      });

      setTotalItems(response.total || 0);
      const mappedOrders = (response.data || []).map((o: any) => ({
        id: o.id_pedido.toString(),
        clienteId: o.id_usuario_cliente?.toString() || "N/A",
        clienteNombre: o.nombre_usuario || "Sin Nombre",
        fecha: o.fecha_pedido ? o.fecha_pedido.split("T")[0] : "N/A",
        productos: [],
        subtotal: Number(o.total) || 0,
        iva: 0,
        costoEnvio: CONFIG.COSTO_ENVIO,
        total: Number(o.total),
        estado: o.estado as OrderStatus,
        direccionEnvio: o.direccion || "N/A",
        pago_confirmado: !!o.pago_confirmado,
        comprobante_url: o.comprobante_url || "",
      }));
      setPedidos(mappedOrders);
    } catch (error) {
      toast.error("Error cargando pedidos");
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      clienteId: "",
      direccionEnvio: "",
      ciudad: "",
      departamento: "",
      productos: [
        { productoId: "", cantidad: 1, precioUnitario: 0, maxStock: 0 },
      ],
      metodo_pago: "transferencia",
    });
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      
      // Auto-completar datos si se selecciona un cliente
      if (name === "clienteId" && value) {
        const selectedClient = clientes.find(c => c.id === value);
        if (selectedClient) {
          if (selectedClient.direccion) newState.direccionEnvio = selectedClient.direccion;
          if (selectedClient.ciudad) newState.ciudad = selectedClient.ciudad;
          if (selectedClient.departamento) newState.departamento = selectedClient.departamento;
        }
      }
      
      return newState;
    });

    if (!value) {
      setFieldErrors((prev) => ({ ...prev, [name]: "Requerido" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const updateProductLine = (
    isEdit: boolean,
    index: number,
    field: string,
    value: any,
    prodObj?: any,
  ) => {
    const currentData = isEdit ? editFormData : formData;
    const newProductos = [...currentData.productos];

    if (field === "productoId") {
      const existingIdx = newProductos.findIndex(
        (p, i) => i !== index && p.productoId === value,
      );
      if (existingIdx !== -1 && value) {
        toast.info("Producto ya agregado.");
        return;
      }
      newProductos[index] = {
        ...newProductos[index],
        productoId: value,
        precioUnitario: prodObj?.precioVenta || 0,
        maxStock: prodObj?.stock || 0,
        cantidad: 1,
      };
      // Clear errors for this line
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[`prod_${index}_id`];
        delete next[`prod_${index}_cant`];
        return next;
      });
    } else if (field === "cantidad") {
      const parsed = parseInt(value);
      newProductos[index].cantidad = isNaN(parsed) ? 0 : parsed;
      
      const ms = newProductos[index].maxStock || 0;
      let error = "";
      if (isNaN(parsed) || parsed <= 0) error = "Mínimo 1";
      else if (parsed > ms) error = `Máx ${ms}`;
      
      setFieldErrors((prev) => ({
        ...prev,
        [`prod_${index}_cant`]: error
      }));
    }

    if (isEdit) setEditFormData({ ...editFormData, productos: newProductos });
    else setFormData({ ...formData, productos: newProductos });
  };

  const handleSave = async () => {
    const errors: Record<string, string> = {};
    if (!formData.clienteId) errors.clienteId = "Requerido";
    if (!formData.direccionEnvio) errors.direccionEnvio = "Requerido";
    if (!formData.ciudad) errors.ciudad = "Requerido";
    if (!formData.departamento) errors.departamento = "Requerido";
    
    formData.productos.forEach((p, i) => {
      if (!p.productoId) errors[`prod_${i}_id`] = "Requerido";
      if (p.cantidad <= 0) errors[`prod_${i}_cant`] = "Mínimo 1";
      else if (p.cantidad > p.maxStock) errors[`prod_${i}_cant`] = `Máx ${p.maxStock}`;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Corrige los errores antes de continuar");
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        id_cliente: Number(formData.clienteId),
        direccion: formData.direccionEnvio,
        ciudad: formData.ciudad || "Bogotá",
        departamento: formData.departamento,
        metodo_pago: formData.metodo_pago,
        items: formData.productos.map((p) => ({
          id_producto: Number(p.productoId),
          cantidad: p.cantidad,
        })),
      };
      await orderService.createDirect(payload);
      toast.success("Pedido creado");
      handlePageChange(1);
      refreshPedidos();
      setIsDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Error al crear");
    } finally {
      setIsSaving(false);
    }
  };
  const handleOpenEdit = async (pedido: any) => {
    try {
      const fullOrder = await orderService.getById(Number(pedido.id));
      setEditingPedido(pedido);
      setEditFormData({
        clienteId: pedido.clienteId,
        direccionEnvio: pedido.direccionEnvio || pedido.direccion,
        ciudad: pedido.ciudad || "",
        departamento: pedido.departamento || "",
        productos: (fullOrder.items || []).map((i: any) => ({
          productoId: i.id_producto.toString(),
          cantidad: Number(i.cantidad),
          precioUnitario: Number(i.precio_unitario) || 0,
          maxStock:
            productos.find((p) => p.id === i.id_producto.toString())?.stock ||
            0,
        })),
      });
      setFieldErrors({});
      setIsEditDialogOpen(true);
    } catch {
      toast.error("Error al cargar");
    }
  };

  const handleEditFieldChange = (name: string, value: any) => {
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (!value) {
      setFieldErrors((prev) => ({ ...prev, [name]: "Requerido" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSaveEdit = async () => {
    const errors: Record<string, string> = {};
    if (!editFormData.direccionEnvio) errors.direccionEnvio = "Requerido";
    if (!editFormData.ciudad) errors.ciudad = "Requerido";
    if (!editFormData.departamento) errors.departamento = "Requerido";

    if (editingPedido.estado === "pendiente") {
      if (!editFormData.clienteId) errors.clienteId = "Requerido";
      editFormData.productos.forEach((p, i) => {
        if (!p.productoId) errors[`prod_${i}_id`] = "Requerido";
        if (p.cantidad <= 0) errors[`prod_${i}_cant`] = "Mínimo 1";
        else if (p.cantidad > p.maxStock) errors[`prod_${i}_cant`] = `Máx ${p.maxStock}`;
      });
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Corrige los errores antes de continuar");
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = { 
        direccion: editFormData.direccionEnvio.trim(),
        ciudad: editFormData.ciudad.trim(),
        departamento: editFormData.departamento.trim()
      };
      if (editingPedido.estado === "pendiente") {
        payload.id_cliente = Number(editFormData.clienteId);
        payload.items = editFormData.productos.map((p) => ({
          id_producto: Number(p.productoId),
          cantidad: p.cantidad,
        }));
      }
      await orderService.update(Number(editingPedido.id), payload);
      toast.success("Actualizado");
      refreshPedidos();
      setIsEditDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (newStatus === "cancelado" && !motivoAnulacion) {
      toast.error("Motivo requerido");
      return;
    }
    if (newStatus === "enviado") {
      setIsStatusDialogOpen(false);
      setIsShippingDialogOpen(true);
      return;
    }
    setIsSaving(true);
    try {
      await orderService.updateStatus(
        Number(selectedPedido.id),
        newStatus,
        Number(currentUser?.id),
        motivoAnulacion,
      );
      toast.success("Estado actualizado");
      refreshPedidos();
      setIsStatusDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmShipping = async () => {
    setIsSaving(true);
    try {
      const tracking_link = getTrackingUrl(
        shippingFormData.transportadora,
        shippingFormData.numero_guia,
      );
      await orderService.updateStatus(
        Number(selectedPedido.id),
        "enviado",
        Number(currentUser?.id),
        "",
        { ...shippingFormData, tracking_link },
      );
      toast.success("Enviado");
      refreshPedidos();
      setIsShippingDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmPayment = async () => {
    setIsSaving(true);
    try {
      const nuevoEstado = !pedidoToConfirm.pago_confirmado;
      await orderService.confirmPayment(
        Number(pedidoToConfirm.id),
        nuevoEstado,
        Number(currentUser?.id),
      );
      toast.success(nuevoEstado ? "Confirmado" : "Removido");
      refreshPedidos();
      setIsPaymentConfirmOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewPDF = async (pedido: any) => {
    try {
      const fullOrder = await orderService.getById(Number(pedido.id));
      const orderData = {
        ...pedido,
        productos: (fullOrder?.items || []).map((i: any) => ({
          productoId: i.id_producto.toString(),
          cantidad: i.cantidad,
          precio_unitario: i.precio_unitario,
        })),
      };
      const cliente = clientes.find((c) => c.id === pedido.clienteId);
      await generateOrderPDF(orderData, cliente, productos, CONFIG);
    } catch {
      toast.error("Error PDF");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f3f5]">
      <PedidoHeader onOpenDialog={handleOpenDialog} />

      <div className="px-8 pb-8">
        <PedidoTable
          pedidos={pedidos}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            handlePageChange(1);
          }}
          onViewDetail={async (p) => {
            const f = await orderService.getById(Number(p.id));
            setSelectedPedido({
              ...p,
              productos: (f?.items || []).map((i: any) => ({
                productoId: i.id_producto.toString(),
                cantidad: i.cantidad,
                precioUnitario: i.precio_unitario,
              })),
            });
            setDetailDialogOpen(true);
          }}
          onViewPDF={handleViewPDF}
          onEdit={handleOpenEdit}
          onStatusClick={(p) => {
            setSelectedPedido(p);
            setNewStatus(p.estado);
            setIsStatusDialogOpen(true);
          }}
          onConfirmPayment={(p) => {
            setPedidoToConfirm(p);
            setIsPaymentConfirmOpen(true);
          }}
          onViewComprobante={(url) => {
            const baseUrl = (
              import.meta.env.VITE_API_URL || "http://localhost:3000/api"
            ).replace("/api", "");
            const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
            setPreviewImageUrl(fullUrl);
            setIsPreviewOpen(true);
          }}
        />

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleLimitChange}
            />
          </div>
        )}
      </div>

      <PedidoFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formData={formData}
        fieldErrors={fieldErrors}
        isSaving={isSaving}
        onSave={handleSave}
        onFieldChange={handleFieldChange}
        onAddProduct={() =>
          setFormData({
            ...formData,
            productos: [
              ...formData.productos,
              { productoId: "", cantidad: 1, precioUnitario: 0, maxStock: 0 },
            ],
          })
        }
        onRemoveProduct={(idx) =>
          setFormData({
            ...formData,
            productos: formData.productos.filter((_, i) => i !== idx),
          })
        }
        onUpdateProduct={(idx, f, v, o) =>
          updateProductLine(false, idx, f, v, o)
        }
      />

      <PedidoEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingPedido={editingPedido}
        formData={editFormData}
        fieldErrors={fieldErrors}
        isSaving={isSaving}
        onSave={handleSaveEdit}
        onFieldChange={handleEditFieldChange}
        onAddProduct={() =>
          setEditFormData({
            ...editFormData,
            productos: [
              ...editFormData.productos,
              { productoId: "", cantidad: 1, precioUnitario: 0, maxStock: 0 },
            ],
          })
        }
        onRemoveProduct={(idx) =>
          setEditFormData({
            ...editFormData,
            productos: editFormData.productos.filter((_, i) => i !== idx),
          })
        }
        onUpdateProduct={(idx, f, v, o) =>
          updateProductLine(true, idx, f, v, o)
        }
      />

      <PedidoStatusDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        selectedPedido={selectedPedido}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        motivoAnulacion={motivoAnulacion}
        setMotivoAnulacion={setMotivoAnulacion}
        isSaving={isSaving}
        onUpdateStatus={handleUpdateStatus}
      />

      <PedidoDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        selectedPedido={selectedPedido}
        productos={productos}
      />

      <PedidoShippingDialog
        open={isShippingDialogOpen}
        onOpenChange={setIsShippingDialogOpen}
        shippingFormData={shippingFormData}
        setShippingFormData={setShippingFormData}
        isSaving={isSaving}
        onConfirm={handleConfirmShipping}
      />

      <PedidoPaymentConfirmDialog
        open={isPaymentConfirmOpen}
        onOpenChange={setIsPaymentConfirmOpen}
        pedidoToConfirm={pedidoToConfirm}
        isSaving={isSaving}
        onConfirm={handleConfirmPayment}
      />

      <PedidoPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        imageUrl={previewImageUrl}
      />
    </div>
  );
}
