import { Router } from "express";
import { listar, obtener, crear, actualizar, eliminar } from "../controllers/proveedores.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { authOptional } from "../middleware/authOptional.middleware.js";
import { tienePermiso } from "../middleware/permisoRequired.middleware.js";

const router = Router();

router.get("/", authOptional, listar);
router.get("/:id", authOptional, obtener);
router.post("/", authRequired, tienePermiso('crear_proveedores'), crear);
router.put("/:id", authRequired, tienePermiso('editar_proveedores'), actualizar);
router.delete("/:id", authRequired, tienePermiso('eliminar_proveedores'), eliminar);

export default router;
