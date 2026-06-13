import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  crearOrden,
  crearOrdenDirecta,
  obtenerOrdenes,
  obtenerDetalleOrden,
  actualizarPedido,
  actualizarEstado,
  cancelarOrden,
  confirmarPago,
  subirComprobante,
  actualizarComprobanteUrl,
  cancelarOrdenPorCliente,
  actualizarDireccionPorCliente,
} from "../controllers/orders.controller.js";
import { tienePermiso } from "../middleware/permisoRequired.middleware.js";
import { uploadComprobante } from '../middleware/upload.js'; 

const router = Router();

const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { message: "Demasiadas órdenes. Intenta de nuevo en un minuto." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rutas específicas PRIMERO (antes de /:id)
router.post("/admin", authRequired, orderLimiter, tienePermiso('crear_pedidos'), crearOrdenDirecta);
router.get("/",  authRequired, obtenerOrdenes);

// Rutas específicas con paths conocidos
router.put("/:id/comprobante_url", authRequired, actualizarComprobanteUrl);
router.put("/:id/comprobante", authRequired, uploadComprobante.single('comprobante'), subirComprobante);
router.put("/:id/status", authRequired, tienePermiso('editar_pedidos'), actualizarEstado);
router.put("/:id/cancel", authRequired, cancelarOrden);
router.put("/:id/cancel-client", authRequired, cancelarOrdenPorCliente);
router.put("/:id/direccion", authRequired, actualizarDireccionPorCliente);
router.put("/:id/pago", authRequired, tienePermiso('editar_pedidos'), confirmarPago);

// Ruta genérica al FINAL
router.put("/:id", authRequired, tienePermiso('editar_pedidos'), actualizarPedido);
router.post("/", authRequired, orderLimiter, crearOrden);
router.get("/:id", authRequired, obtenerDetalleOrden);

export default router;
