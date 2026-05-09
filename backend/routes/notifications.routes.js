import { Router } from "express";
import { getNotificationSummary } from "../controllers/notifications.controller.js";
import { authRequired } from "../middleware/auth.middleware.js";
import { adminRequired } from "../middleware/adminRequired.middleware.js";

const router = Router();

// Solo los administradores pueden ver el resumen de notificaciones
router.get("/summary", authRequired, adminRequired, getNotificationSummary);

export default router;
