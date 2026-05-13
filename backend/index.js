import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import productsRoutes from "./routes/productos.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import rolesRoutes from "./routes/roles.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";
import proveedoresRoutes from "./routes/proveedores.routes.js";
import marcasRoutes from "./routes/marcas.routes.js";
import comprasRoutes from "./routes/compras.routes.js";
import ventasRoutes from "./routes/ventas.routes.js";
import devolucionesRoutes from "./routes/devoluciones.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";

dotenv.config();

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use("/uploads", express.static("uploads"));
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/marcas", marcasRoutes);
app.use("/api/compras", comprasRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/devoluciones", devolucionesRoutes);
app.use("/api/notifications", notificationsRoutes);

// Ruta de prueba general
app.get("/", (req, res) => {
  res.json({
    message: "GlamourML API",
    version: "1.0.0",
    status: "running",
  });
});

const PORT = process.env.PORT || 3000;

// Solo iniciar el servidor si no estamos en Vercel
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 UNHANDLED REJECTION:", reason);
});

// Exportar para Vercel
export default app;
