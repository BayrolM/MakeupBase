import { Router } from "express";
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
import { adminRequired } from "../middleware/adminRequired.middleware.js";
import { uploadComprobante } from '../middleware/upload.js'; 

const router = Router();

// Rutas específicas PRIMERO (antes de /:id)
router.post("/admin", authRequired, adminRequired, crearOrdenDirecta);
router.get("/",  authRequired, obtenerOrdenes);

// Rutas específicas con paths conocidos
router.put("/:id/comprobante_url", authRequired, actualizarComprobanteUrl);
router.put("/:id/comprobante", uploadComprobante.single('comprobante'), subirComprobante);
router.put("/:id/status", authRequired, adminRequired, actualizarEstado);
router.put("/:id/cancel", authRequired, cancelarOrden);
router.put("/:id/cancel-client", authRequired, cancelarOrdenPorCliente);
router.put("/:id/direccion", authRequired, actualizarDireccionPorCliente);
router.put("/:id/pago", authRequired, adminRequired, confirmarPago);

// Ruta genérica al FINAL
router.put("/:id", authRequired, adminRequired, actualizarPedido);
router.post("/", authRequired, crearOrden);
router.get("/:id", authRequired, obtenerDetalleOrden);

export default router;
