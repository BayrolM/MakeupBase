import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware.js';
import { adminRequired } from '../middleware/adminRequired.middleware.js';
import {
  obtenerDashboard,
  obtenerReporteVentas,
  obtenerReporteStock,
  obtenerReporteUsuarios,
  obtenerDetalleVenta,
  obtenerComparacionVentas,
} from '../controllers/reports.controller.js';

const router = Router();

router.get('/dashboard', authRequired, adminRequired, obtenerDashboard);
router.get('/sales', authRequired, adminRequired, obtenerReporteVentas);
router.get('/stock', authRequired, adminRequired, obtenerReporteStock);
router.get('/usuarios', authRequired, adminRequired, obtenerReporteUsuarios);
router.get('/sales-comparison', authRequired, adminRequired, obtenerComparacionVentas);
router.get('/sales/:id', authRequired, adminRequired, obtenerDetalleVenta);

export default router;