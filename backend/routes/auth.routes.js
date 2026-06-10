import { Router } from "express";
import { register, login, forgotPassword, resetPassword, verifyEmail, checkEmail, verifyResetCode } from "../controllers/auth.controller.js";
import rateLimit from "express-rate-limit";

// Login: máximo 10 intentos por IP cada 15 minutos
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: "Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.",
  },
});

// Recuperación de contraseña: máximo 5 solicitudes por IP cada hora
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: "Demasiadas solicitudes de recuperación. Intenta de nuevo en 1 hora.",
  },
});

// Registro: máximo 10 cuentas por IP cada hora
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: "Demasiados registros desde esta IP. Intenta de nuevo en 1 hora.",
  },
});

const router = Router();

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/check-email", checkEmail);
router.post("/verify-reset-code", verifyResetCode);

export default router;
