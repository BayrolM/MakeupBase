import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  crearOrden,
  crearOrdenDirecta,
  obtenerOrdenes,
  obtenerDetalleOrden,
  actualizarEstado
} from "../controllers/orders.controller.js";

const router = Router();

router.post("/", authRequired, crearOrden);
router.post("/admin", authRequired, crearOrdenDirecta);
router.get("/", authRequired, obtenerOrdenes);
router.get("/:id", authRequired, obtenerDetalleOrden);
router.put("/:id/status", authRequired, actualizarEstado);

export default router;
