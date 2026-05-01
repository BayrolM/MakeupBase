import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware.js";
import {
  listarRoles,
  obtenerRol,
  crearRol,
  actualizarRol,
  eliminarRol,
  asignarPermisos,
  listarPermisos,
  eliminarPermiso,
} from "../controllers/roles.controller.js";
import { adminRequired } from "../middleware/adminRequired.middleware.js";

const router = Router();


router.get("/", adminRequired,authRequired, listarRoles);
router.get("/permisos", adminRequired, authRequired, listarPermisos);
router.get("/:id", adminRequired, authRequired, obtenerRol);
router.post("/", adminRequired, authRequired, crearRol);
router.put("/:id", adminRequired, authRequired, actualizarRol);
router.delete("/:id", adminRequired, authRequired, eliminarRol);
router.post("/:id/permisos", adminRequired, authRequired, asignarPermisos);
router.delete("/:id/permisos/:id_permiso", adminRequired, authRequired, eliminarPermiso);

export default router;
