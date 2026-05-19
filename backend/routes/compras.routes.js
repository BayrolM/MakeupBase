import { Router } from "express";
import { listar, obtener, crear, anular } from "../controllers/compras.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { tienePermiso } from "../middleware/permisoRequired.middleware.js";

const router = Router();

router.get("/", authRequired, tienePermiso('ver_compras'), listar);
router.get("/:id", authRequired, tienePermiso('ver_compras'), obtener);
router.post("/", authRequired, tienePermiso('crear_compras'), crear);
router.put("/:id/anular", authRequired, tienePermiso('eliminar_compras'), anular);

export default router;
