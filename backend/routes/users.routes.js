import { Router } from "express";
import {
  getProfile,
  updateProfile,
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  eliminarUsuario,
  changePassword,
} from "../controllers/users.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { tienePermisoUsuarioOCliente } from "../middleware/permisoRequired.middleware.js";

const router = Router();

// Rutas de perfil del usuario autenticado
router.get("/profile", authRequired, getProfile);
router.put("/profile", authRequired, updateProfile);
router.put("/profile/password", authRequired, changePassword);

// Rutas de administración de usuarios y clientes (requieren permisos dinámicos según el tipo de registro)
router.get("/", authRequired, tienePermisoUsuarioOCliente('ver'), listarUsuarios);
router.post("/", authRequired, tienePermisoUsuarioOCliente('crear'), crearUsuario);
router.get("/:id", authRequired, tienePermisoUsuarioOCliente('ver'), obtenerUsuario);
router.put("/:id", authRequired, tienePermisoUsuarioOCliente('editar'), actualizarUsuario);
router.delete("/:id", authRequired, tienePermisoUsuarioOCliente('eliminar'), desactivarUsuario);
router.delete("/:id/permanent", authRequired, tienePermisoUsuarioOCliente('eliminar'), eliminarUsuario);

export default router;
