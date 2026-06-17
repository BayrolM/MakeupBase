import { useState, useEffect } from "react";
import { useStore } from "../lib/store";
import { orderService } from "../services/orderService";
import { productService } from "../services/productService";
import { userService } from "../services/userService";
import { uploadToSupabase } from "../lib/supabaseUpload";
import { toast } from "sonner";

export const colombianDepartments = [
  "Amazonas","Antioquia","Arauca","Atlántico","Bolívar","Boyacá","Caldas","Caquetá","Casanare","Cauca",
  "Cesar","Chocó","Córdoba","Cundinamarca","Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta",
  "Nariño","Norte de Santander","Putumayo","Quindío","Risaralda","Santander","Sucre","Tolima","Valle del Cauca","Vaupés","Vichada",
];

export const mainCities: Record<string, string[]> = {
  "Antioquia": ["Medellín","Bello","Itagüí","Envigado","Apartadó","Turbo","Rionegro","Caldas","La Estrella","Copacabana"],
  "Atlántico": ["Barranquilla","Soledad","Malambo","Sabanalarga","Puerto Colombia"],
  "Bolívar": ["Cartagena","Turbaco","Arjona","Magangué","Tulúa"],
  "Boyacá": ["Tunja","Duitama","Sogamoso","Chiquinquirá","Mora"],
  "Caldas": ["Manizales","Villamaría","Chinchiná","La Dorada","Riosucio"],
  "Cauca": ["Popayán","Santander de Quilichao","Puerto Tejada","Guapi","El Tambo"],
  "Cesar": ["Valledupar","Aguachica","San Alberto","Chiriguaná","Bosconia"],
  "Córdoba": ["Montería","Caucasia","Cereté","Sahagún","Montelíbano"],
  "Cundinamarca": ["Soacha","Girardot","Facatativá","Zipaquirá","Fusagasugá","Chía","Cajicá","Mosquera","Funza","Madrid"],
  "Huila": ["Neiva","Pitalito","Garzón","La Plata","Rivera"],
  "La Guajira": ["Riohacha","Maicao","San Juan del Cesar","Uribia","Manaure"],
  "Magdalena": ["Santa Marta","Ciénaga","Fundación","Aracataca","El Banco"],
  "Meta": ["Villavicencio","Acacías","Granada","Puerto Gaitán","San Martín"],
  "Nariño": ["Pasto","Tumaco","Ipiales","Buesaco","Samaniego"],
  "Norte de Santander": ["Cúcuta","Ocaña","Pamplona","Villa del Rosario","Chitagá"],
  "Quindío": ["Armenia","Montenegro","Circasia","Filandia","Salento"],
  "Risaralda": ["Pereira","Dosquebradas","La Virginia","Santa Rosa de Cabal","Mistrató"],
  "Santander": ["Bucaramanga","Floridablanca","Barrancabermeja","Girón","Piedecuesta"],
  "Sucre": ["Sincelejo","Corozal","Sampués","Caucasia","Tolú"],
  "Tolima": ["Ibagué","Melgar","Honda","Espinal","Chaparral"],
  "Valle del Cauca": ["Cali","Palmira","Buenaventura","Tuluá","Buga","Jamundí","Yumbo"],
};

export function useCheckoutLogic(onComplete: () => void) {
  const {
    carrito,
    productos,
    currentUser,
    setCurrentUser,
    addPedido,
    updateStock,
    clearCarrito,
    removeFromCarrito,
  } = useStore();

  const [step, setStep] = useState(1);
  const [direccionEnvio, setDireccionEnvio] = useState(currentUser?.direccion || "");
  const [ciudadEnvio, setCiudadEnvio] = useState(currentUser?.ciudad || "");
  const [departamentoEnvio, setDepartamentoEnvio] = useState(currentUser?.departamento || "");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState("");
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);
  const [stockValidated, setStockValidated] = useState(false);

  // Validar stock real de productos en carrito al montar checkout
  useEffect(() => {
    const validateStock = async () => {
      for (const item of carrito) {
        try {
          const freshProduct = await productService.getById(parseInt(item.productoId, 10));
          if (freshProduct.stock_actual <= 0) {
            removeFromCarrito(item.productoId);
            toast.error(`"${freshProduct.nombre}" se agotó`, {
              description: "El producto fue retirado de tu carrito.",
            });
          } else if (item.cantidad > freshProduct.stock_actual) {
            toast.warning(`Solo quedan ${freshProduct.stock_actual} unidades de "${freshProduct.nombre}"`, {
              description: "Ajusta la cantidad antes de continuar.",
            });
          }
        } catch {
          // Se validará nuevamente al confirmar el pago
        }
      }
      setStockValidated(true);
    };
    if (carrito.length > 0) {
      validateStock();
    } else {
      setStockValidated(true);
    }
  }, [carrito, removeFromCarrito]);

  const subtotal = carrito.reduce((sum, item) => {
    const producto = productos.find((p) => p.id === item.productoId);
    return sum + (producto ? producto.precioVenta * item.cantidad : 0);
  }, 0);

  const costoEnvio = 0;
  const total = subtotal;

  const handleContinuarPago = () => {
    setStep(2);
  };

  const generateOrderNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `P-${year}-${random}`;
  };

  const handleConfirmPayment = async () => {
    if (!currentUser) return;
    setIsProcessing(true);

    for (const item of carrito) {
      try {
        const freshProduct = await productService.getById(parseInt(item.productoId, 10));
        if (freshProduct.stock_actual <= 0) {
          removeFromCarrito(item.productoId);
          toast.error(`"${freshProduct.nombre}" se agotó mientras comprabas`, {
            description: "El producto ha sido retirado de tu carrito.",
          });
          setIsProcessing(false);
          return;
        }
        if (item.cantidad > freshProduct.stock_actual) {
          toast.error(`Solo quedan ${freshProduct.stock_actual} unidades de "${freshProduct.nombre}"`, {
            description: "Ajusta la cantidad en tu carrito",
          });
          setIsProcessing(false);
          return;
        }
      } catch {
        const producto = productos.find((p) => p.id === item.productoId);
        if (!producto || producto.stock <= 0) {
          removeFromCarrito(item.productoId);
          toast.error(`"${producto?.nombre || "Un producto"}" se ha agotado`, {
            description: "El producto ha sido retirado de tu carrito.",
          });
          setIsProcessing(false);
          return;
        } else if (producto.stock < item.cantidad) {
          toast.error(`Stock insuficiente para ${producto?.nombre || "producto"}`);
          setIsProcessing(false);
          return;
        }
      }
    }

    try {
      setFinalTotal(total);

      const orderData = {
        direccion: direccionEnvio,
        ciudad: ciudadEnvio || "N/A",
        departamento: departamentoEnvio || "N/A",
        metodo_pago: "transferencia",
        items: carrito.map((item) => ({
          id_producto: parseInt(item.productoId, 10),
          cantidad: item.cantidad,
        })),
      };

      const response = await orderService.create(orderData);
      const idPedido = response.id_pedido;

      // Actualizar datos de envío por defecto si el cliente no los tiene
      if (currentUser) {
        const updateData: any = {};
        if (!currentUser.direccion && direccionEnvio) updateData.direccion = direccionEnvio;
        if (!currentUser.ciudad && ciudadEnvio) updateData.ciudad = ciudadEnvio;
        if (!currentUser.departamento && departamentoEnvio) updateData.departamento = departamentoEnvio;

        if (Object.keys(updateData).length > 0) {
          try {
            await userService.updateProfile(updateData);
            setCurrentUser({ ...currentUser, ...updateData });
          } catch (updateError) {
            console.error("Error al actualizar perfil por defecto:", updateError);
          }
        }
      }

      let comprobanteUrl = "";
      if (comprobanteFile && idPedido) {
        setIsUploading(true);
        try {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(comprobanteFile);
          });
          const base64Data = await base64Promise;
          const pendingKey = `gml_pending_comprobante_${idPedido}`;
          localStorage.setItem(pendingKey, JSON.stringify({
            orderId: idPedido,
            fileName: comprobanteFile.name,
            fileType: comprobanteFile.type,
            data: base64Data,
            createdAt: Date.now(),
          }));

          try {
            const uploadResult = await uploadToSupabase(comprobanteFile, "comprobantes");
            comprobanteUrl = uploadResult.secure_url;
            await orderService.updateComprobanteUrl(idPedido, comprobanteUrl);
            localStorage.removeItem(pendingKey);
          } catch (uploadError) {
            console.error("Upload failed, guardado en localStorage para reintento:", uploadError);
            toast.info("Comprobante guardado localmente", {
              description: "Se subirá automáticamente cuando vuelva la conexión.",
            });
          }
        } catch (fileError) {
          console.error("Error procesando archivo:", fileError);
        } finally {
          setIsUploading(false);
        }
      }

      const productosConPrecios = carrito.map((item) => {
        const producto = productos.find((p) => p.id === item.productoId);
        return {
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: producto?.precioVenta || 0,
        };
      });

      setGeneratedOrderId(response.id_pedido?.toString() || generateOrderNumber());

      addPedido({
        id: idPedido.toString(),
        clienteId: currentUser.id,
        fecha: new Date().toISOString().split("T")[0],
        productos: productosConPrecios,
        subtotal,
        costoEnvio,
        total,
        estado: "pendiente",
        pago_confirmado: false,
        comprobante_url: comprobanteUrl,
        direccionEnvio,
      });

      carrito.forEach((item) => {
        updateStock(item.productoId, -item.cantidad);
      });

      clearCarrito();
      setShowConfirmDialog(false);
      setStep(3);
    } catch (error: any) {
      toast.error("Error al procesar el pedido", {
        description: error.message || "Inténtalo de de nuevo más tarde",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        onComplete();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [step, onComplete]);

  return {
    step,
    setStep,
    carrito,
    productos,
    total,
    subtotal,
    costoEnvio,
    direccionEnvio,
    setDireccionEnvio,
    ciudadEnvio,
    setCiudadEnvio,
    departamentoEnvio,
    setDepartamentoEnvio,
    comprobanteFile,
    setComprobanteFile,
    isUploading,
    showConfirmDialog,
    setShowConfirmDialog,
    isProcessing,
    generatedOrderId,
    finalTotal,
    stockValidated,
    handleContinuarPago,
    handleConfirmPayment,
    currentUser
  };
}
