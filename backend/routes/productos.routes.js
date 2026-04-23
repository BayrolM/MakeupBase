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
} from "../controllers/productos.controller.js";
import { adminRequired } from "../middleware/adminRequired.middleware.js";

const router = Router();

router.get("/", authOptional, listar);
router.get("/featured", authOptional, featured);
router.get("/:id", authOptional, obtener);
router.post("/", authRequired, adminRequired, crear);
router.put("/:id", authRequired, adminRequired, actualizar);
router.delete("/:id", authRequired, adminRequired, eliminar);

export default router;