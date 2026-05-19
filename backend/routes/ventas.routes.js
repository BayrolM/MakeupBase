import { Router } from "express";
import { listar, crear, anular } from "../controllers/ventas.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { tienePermiso } from "../middleware/permisoRequired.middleware.js";

const router = Router();

router.get("/", authRequired, tienePermiso('ver_ventas'), listar);
router.post("/", authRequired, tienePermiso('crear_ventas'), crear);
router.put("/anular/:id", authRequired, tienePermiso('eliminar_ventas'), anular);

export default router;
