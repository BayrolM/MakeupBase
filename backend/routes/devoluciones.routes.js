import { Router } from "express";
import { listar, obtener, crear, cambiarEstado, anular } from "../controllers/devoluciones.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { tienePermiso } from "../middleware/permisoRequired.middleware.js";

const router = Router();

router.get("/", authRequired, tienePermiso('ver_devoluciones'), listar);
router.get("/:id", authRequired, tienePermiso('ver_devoluciones'), obtener);
router.post("/", authRequired, tienePermiso('crear_devoluciones'), crear);
router.put("/:id/estado", authRequired, tienePermiso('editar_devoluciones'), cambiarEstado);
router.put("/:id/anular", authRequired, tienePermiso('eliminar_devoluciones'), anular);

export default router;
