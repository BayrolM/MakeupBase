import { Router } from "express";
import { getNotificationSummary } from "../controllers/notifications.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { tienePermiso } from "../middleware/permisoRequired.middleware.js";

const router = Router();

// Los usuarios con permisos en productos pueden ver el resumen de notificaciones
router.get("/summary", authRequired, tienePermiso('ver_productos'), getNotificationSummary);

export default router;
