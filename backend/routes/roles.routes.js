import { Router } from "express";
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

// adminRequired ya verifica el token JWT y que el rol sea 1 (admin),
// por lo que authRequired sería redundante aquí.
router.get("/", adminRequired, listarRoles);
router.get("/permisos", adminRequired, listarPermisos);
router.get("/:id", adminRequired, obtenerRol);
router.post("/", adminRequired, crearRol);
router.put("/:id", adminRequired, actualizarRol);
router.delete("/:id", adminRequired, eliminarRol);
router.post("/:id/permisos", adminRequired, asignarPermisos);
router.delete("/:id/permisos/:id_permiso", adminRequired, eliminarPermiso);

export default router;
