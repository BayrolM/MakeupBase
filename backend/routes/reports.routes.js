import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware.js';
import { tienePermiso } from '../middleware/permisoRequired.middleware.js';
import {
  obtenerDashboard,
  obtenerReporteVentas,
  obtenerReporteStock,
  obtenerReporteUsuarios,
  obtenerDetalleVenta,
  obtenerComparacionVentas,
} from '../controllers/reports.controller.js';

const router = Router();

router.get('/dashboard', authRequired, tienePermiso('ver_ventas'), obtenerDashboard);
router.get('/sales', authRequired, tienePermiso('ver_ventas'), obtenerReporteVentas);
router.get('/stock', authRequired, tienePermiso('ver_productos'), obtenerReporteStock);
router.get('/usuarios', authRequired, tienePermiso('ver_usuarios'), obtenerReporteUsuarios);
router.get('/sales-comparison', authRequired, tienePermiso('ver_ventas'), obtenerComparacionVentas);
router.get('/sales/:id', authRequired, tienePermiso('ver_ventas'), obtenerDetalleVenta);

export default router;