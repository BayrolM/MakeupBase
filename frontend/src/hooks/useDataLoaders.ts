import { useEffect } from "react";
import { useStore, Cliente } from "../lib/store";
import { categoryService } from "../services/categoryService";
import { marcaService } from "../services/marcaService";
import { productService } from "../services/productService";
import { providerService } from "../services/providerService";
import { purchaseService } from "../services/purchaseService";
import { userService } from "../services/userService";
import { orderService } from "../services/orderService";
import { uploadToSupabase } from "../lib/supabaseUpload";

export function useDataLoaders() {
  const {
    setProductos,
    setCategorias,
    setMarcas,
    setProveedores,
    setCompras,
    setClientes,
    setPedidos,
    currentUser,
    userType,
  } = useStore();

  const loadPublicData = async () => {
    try {
      const categoriesData = await categoryService.getAll({ limit: 100 });
      const mappedCategories = categoriesData.data.map((cat: any) => ({
        id: cat.id_categoria.toString(),
        nombre: cat.nombre,
        descripcion: cat.descripcion || "",
        estado: cat.estado ? ("activo" as const) : ("inactivo" as const),
      }));
      setCategorias(mappedCategories);

      const brandsData = await marcaService.getAll();
      const mappedBrands = brandsData.data.map((brand: any) => ({
        id: brand.id_marca.toString(),
        nombre: brand.nombre,
        descripcion: brand.descripcion || "",
        estado: brand.estado ? ("activo" as const) : ("inactivo" as const),
      }));
      setMarcas(mappedBrands);

      const productsResponse = await productService.getAll({ limit: 100 });
      const mappedProducts = productsResponse.data.map((prod) => ({
        id: prod.id_producto.toString(),
        nombre: prod.nombre,
        descripcion: prod.descripcion || "",
        categoriaId: prod.id_categoria.toString(),
        marca: (prod as any).nombre_marca || "Genérica",
        precioCompra: Number(prod.costo_promedio) || 0,
        precioVenta: Number(prod.precio_venta) || 0,
        stock: prod.stock_actual || 0,
        stockMinimo: prod.stock_min || 0,
        stockMaximo: prod.stock_max || 100,
        stockFisico: prod.stock_fisico || 0,
        imagenUrl: prod.imagen_url || undefined,
        estado: prod.estado ? ("activo" as const) : ("inactivo" as const),
        fechaCreacion: new Date().toISOString(),
      }));
      setProductos(mappedProducts);
    } catch (error) {
      console.error("Error cargando datos públicos:", error);
    }
  };

  const loadPrivateData = async (userRol?: string | number) => {
    // If no role provided, use current or default to cliente
    const role = userRol || currentUser?.rol || userType;
    const isAdmin = role === "admin" || role === 1;

    try {
      if (isAdmin) {
        const providersData = await providerService.getAll();
        const mappedProviders = providersData.map((prov) => ({
          id: prov.id_proveedor.toString(),
          tipo_proveedor: prov.tipo_proveedor || "Persona Natural",
          nombre: prov.nombre,
          email: prov.email || "",
          telefono: prov.telefono || "",
          nit: prov.documento_nit || "",
          direccion: prov.direccion || "",
          estado: prov.estado ? ("activo" as const) : ("inactivo" as const),
          fechaRegistro: prov.fecha_registro || new Date().toISOString(),
        }));
        setProveedores(mappedProviders);

        const purchasesData = await purchaseService.getAll();
        const purchasesArray = Array.isArray(purchasesData)
          ? purchasesData
          : (purchasesData as any).data || [];
        const mappedPurchases = purchasesArray.map((purch: any) => ({
          id: purch.id_compra.toString(),
          proveedorId: purch.id_proveedor.toString(),
          fecha: purch.fecha_compra,
          total: Number(purch.total) || 0,
          estado:
            purch.estado === true || purch.estado === 1
              ? ("confirmada" as const)
              : ("anulada" as const),
          confirmada: !!purch.estado,
          observaciones: purch.observaciones || "",
          productos: (purch.productos || []).map((p: any) => ({
            productoId: p.id_producto.toString(),
            cantidad: Number(p.cantidad),
            precioUnitario: Number(p.precio_unitario),
          })),
        }));
        setCompras(mappedPurchases);

        // Cargar clientes REALES de la base de datos
        const clientsData = await userService.getAll({ id_rol: 2 });
        const mappedClients: Cliente[] = clientsData.data.map((c: any) => {
          const nombres = c.nombres || c.nombre || "";
          const apellidos = c.apellidos || c.apellido || "";
          return {
            id: c.id_usuario.toString(),
            nombre: `${nombres} ${apellidos}`.trim() || "Sin Nombre",
            nombres: nombres,
            apellidos: apellidos,
            email: c.email,
            telefono: c.telefono || "",
            documento: c.documento || "",
            numeroDocumento: c.documento || "",
            estado: c.estado ? ("activo" as const) : ("inactivo" as const),
            totalCompras: Number(c.total_ventas) || 0,
            foto_perfil: c.foto_perfil,
            fechaRegistro:
              c.get_fecha_creacion ||
              c.fecha_creacion ||
              new Date().toISOString(),
          };
        });
        setClientes(mappedClients);
      }

      // Cargar Pedidos REALES
      const ordersData = await orderService.getAll({ limit: 100 });
      const mappedOrders = ordersData.data.map((o: any) => ({
        id: o.id_pedido?.toString() || "0",
        clienteId: (o.id_usuario_cliente || o.id_usuario)?.toString() || "0",
        fecha: o.fecha_pedido,
        total: Number(o.total) || 0,
        subtotal: (Number(o.total) || 0) / 1.19,
        iva: (Number(o.total) || 0) - (Number(o.total) || 0) / 1.19,
        costoEnvio: 0,
        estado: o.estado as any,
        direccionEnvio: o.direccion || "",
        pago_confirmado: !!o.pago_confirmado,
        comprobante_url: o.comprobante_url || "",
        fechaVenta: o.fecha_venta || null,
        productos: (o.items || []).map((i: any) => ({
          productoId: (i.id_producto || i.id_detalle_pedido)?.toString() || "0",
          cantidad: i.cantidad || 0,
          precioUnitario: Number(i.precio_unitario) || 0,
        })),
      }));
      setPedidos(mappedOrders);
    } catch (error) {
      console.error("Error cargando datos privados:", error);
    }
  };

  // Sincronizar comprobantes pendientes de upload
  useEffect(() => {
    const syncPendingComprobantes = async () => {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("gml_pending_comprobante_"));
      for (const key of keys) {
        try {
          const pending = JSON.parse(localStorage.getItem(key) || "{}");
          if (!pending.orderId || !pending.data) continue;

          // Convertir base64 a File
          const res = await fetch(pending.data);
          const blob = await res.blob();
          const file = new File([blob], pending.fileName || "comprobante.jpg", { type: pending.fileType || "image/jpeg" });

          const uploadResult = await uploadToSupabase(file, "comprobantes");
          await orderService.updateComprobanteUrl(pending.orderId, uploadResult.secure_url);
          localStorage.removeItem(key);
        } catch {
          // Seguirá pendiente para el próximo intento
        }
      }
    };

    // Ejecutar al montar y cuando vuelva la conexión
    syncPendingComprobantes();
    const handleOnline = () => syncPendingComprobantes();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return { loadPublicData, loadPrivateData };
}
