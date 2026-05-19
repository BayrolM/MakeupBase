import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import { authOptional } from "../middleware/authOptional.middleware.js";
import {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  featured,
  moverStock,
} from "../controllers/productos.controller.js";
import { tienePermiso } from "../middleware/permisoRequired.middleware.js";

const router = Router();

router.get("/", authOptional, listar);
router.get("/featured", authOptional, featured);
router.get("/:id", authOptional, obtener);
router.post("/", authRequired, tienePermiso('crear_productos'), crear);
router.put("/:id", authRequired, tienePermiso('editar_productos'), actualizar);
router.delete("/:id", authRequired, tienePermiso('eliminar_productos'), eliminar);
router.post("/:id/mover-stock", authRequired, tienePermiso('editar_productos'), moverStock);

export default router;