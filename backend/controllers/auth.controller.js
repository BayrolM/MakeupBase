import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sql from "../config/db.js";
import { createRequire } from "module";
import crypto from "crypto";
const require = createRequire(import.meta.url);
const { BrevoClient } = require("@getbrevo/brevo");

// Inicializar el cliente de Brevo
const brevoClient = new BrevoClient({ apiKey: process.env.BREVO_API_KEY || "" });

export const register = async (req, res) => {
  try {
    const {
      id_rol,
      tipo_documento,
      documento,
      nombres,
      apellidos,
      email,
      telefono,
      direccion,
      ciudad,
      departamento,
      password,
    } = req.body;

    // Mapear para la base de datos
    const nombre = nombres;
    const apellido = apellidos;

    console.log("📝 === Register Request ===");
    console.log("📧 Email:", email);
    console.log("👤 Nombre Completo:", nombre, apellido);

    // Validar campos requeridos
    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }

    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      return res.status(400).json({
        message:
          "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial",
      });
    }

    // Verificar si el correo ya existe
    console.log("🔍 Verificando si el email ya existe...");
    const emailExists =
      await sql`SELECT * FROM usuarios WHERE email = ${email}`;

    if (emailExists.length > 0) {
      console.log("❌ Email ya registrado:", email);
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Verificar si el documento ya existe (si se proporciona)
    if (documento && documento.trim() !== "") {
      console.log("🔍 Verificando si el documento ya existe...");
      const docExists = await sql`SELECT * FROM usuarios WHERE documento = ${documento.trim()}`;
      if (docExists.length > 0) {
        console.log("❌ Documento ya registrado:", documento);
        return res.status(400).json({ message: "El número de documento ya está registrado" });
      }
    }

    console.log("✅ Email y Documento disponibles");
    console.log("🔐 Encriptando contraseña...");

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("💾 Insertando usuario en BD...");
    const result = await sql`
      INSERT INTO usuarios (
        id_rol, tipo_documento, documento, nombre, apellido,
        email, telefono, direccion, ciudad, departamento, password_hash, estado
      )
      VALUES (
        ${id_rol || 2}, ${tipo_documento || "CC"}, ${
          documento || ""
        }, ${nombre}, ${apellido},
        ${email}, ${telefono || ""}, ${direccion || ""}, ${
          ciudad || ""
        }, ${departamento || ""}, ${hashedPassword}, true
      )
      RETURNING id_usuario, email, nombre as nombres, apellido as apellidos
    `;

    console.log("✅ Usuario registrado exitosamente:", result[0].email);

    // --- ENVIAR CORREO DE BIENVENIDA ---
    try {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

      brevoClient.transactionalEmails.sendTransacEmail({
        subject: "¡Bienvenida a Glamour ML! 💖",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fdf5f8; border-radius: 12px; border: 1px solid #f0d5e0;">
            <div style="text-align: center; margin-bottom: 20px; background-color: #2e1020; padding: 30px; border-radius: 12px 12px 0 0;">
              <img src="https://rjrafmgjtuuqtprmfhwc.supabase.co/storage/v1/object/public/comprobantes/logo.png" alt="Glamour ML Logo" style="width: 80px; height: 80px; border-radius: 16px; background-color: #000; box-shadow: 0 4px 10px rgba(0,0,0,0.3);" />
              <h1 style="color: #fff; margin-top: 15px; margin-bottom: 0; font-size: 28px; letter-spacing: 2px;">GLAMOUR ML</h1>
              <p style="color: #e092b2; font-size: 12px; margin-top: 5px; letter-spacing: 1px;">TIENDA DE BELLEZA & CUIDADO PERSONAL</p>
            </div>
            <div style="padding: 30px 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
              <h2 style="color: #c47b96; text-align: center; font-size: 24px; margin-top: 0;">¡Hola, ${nombre}! ✨</h2>
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Estamos muy felices de darte la bienvenida a <strong>Glamour ML</strong>.</p>
              <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Tu cuenta ha sido creada exitosamente. A partir de ahora podrás explorar nuestro catálogo completo de belleza, realizar pedidos rápidos de tus productos favoritos y llevar un registro detallado de todas tus compras.</p>
              <div style="text-align: center; margin: 40px 0;">
                <a href="${frontendUrl}/" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #c47b96 0%, #a85d77 100%); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(196,123,150,0.4);">Explorar el Catálogo</a>
              </div>
              <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center; border-top: 1px solid #f0d5e0; padding-top: 20px;">
                Con cariño,<br/>
                <strong style="color: #2e1020; font-size: 16px; display: inline-block; margin-top: 8px;">El equipo de Glamour ML</strong>
              </p>
            </div>
          </div>
        `,
        sender: { name: "Glamour ML", email: process.env.BREVO_SENDER_EMAIL || "tu-correo@gmail.com" },
        to: [{ email: email, name: nombre }],
      }).catch(e => console.error("Error enviando email de bienvenida:", e));
      console.log("✉️  Correo de bienvenida despachado a Brevo");
    } catch (emailError) {
      console.error("💥 Error preparando correo de bienvenida:", emailError);
    }

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      usuario: result[0],
    });
  } catch (error) {
    console.error("💥 ERROR en register:", error);
    console.error("📋 Stack trace:", error.stack);
    
    // Capturar errores específicos de claves duplicadas de PostgreSQL
    if (error.message && error.message.includes("usuarios_documento_key")) {
      return res.status(400).json({ message: "El número de documento ya está registrado" });
    }
    if (error.message && error.message.includes("usuarios_email_key")) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }
    
    return res.status(500).json({
      message: "Error en el servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔐 === Login Request ===");
    console.log("📧 Email:", email);
    console.log("🔑 JWT_SECRET configurado:", !!process.env.JWT_SECRET);

    // Verificar que JWT_SECRET existe
    if (!process.env.JWT_SECRET) {
      console.error("❌ ERROR: JWT_SECRET no está configurado en .env");
      return res
        .status(500)
        .json({ message: "Error de configuración del servidor" });
    }

    console.log("🔍 Buscando usuario en la BD...");
    const result = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
    console.log(
      "📊 Resultado de búsqueda:",
      result.length,
      "usuario(s) encontrado(s)",
    );

    if (result.length === 0) {
      console.log("❌ Usuario no encontrado con email:", email);
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    const user = result[0];
    console.log(
      "✅ Usuario encontrado:",
      user.email,
      "- id_usuario:",
      user.id_usuario,
    );
    console.log("🔐 Campos disponibles:", Object.keys(user));

    // Verificar que el campo de contraseña existe
    if (!user.password_hash) {
      console.error(
        "❌ ERROR: Campo 'password_hash' no encontrado en usuario. Campos disponibles:",
        Object.keys(user),
      );
      return res
        .status(500)
        .json({ message: "Error de configuración de base de datos" });
    }

    console.log("🔑 Verificando contraseña...");
    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log("✅ Contraseña válida:", validPassword);

    if (!validPassword) {
      console.log("❌ Contraseña incorrecta para usuario:", email);
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    // Verificar que el usuario esté activo
    if (user.estado === false || user.estado === 0) {
      console.log("❌ Usuario inactivo:", email);
      return res.status(403).json({
        code: "USER_INACTIVE",
        message: "Tu cuenta está inactiva. Contacta al administrador.",
      });
    }

    console.log("🎟️ Generando JWT...");
    if (!user.id_rol) {
      console.error("❌ ERROR: El usuario no tiene id_rol:", user);
    }

    // Obtener los permisos del rol
    let permisos = [];
    if (user.id_rol === 1) {
      const todosPermisos = await sql`SELECT nombre FROM permisos WHERE estado = true`;
      permisos = todosPermisos.map((p) => p.nombre);
    } else {
      const permisosUsuario = await sql`
        SELECT p.nombre
        FROM roles_permisos rp
        JOIN permisos p ON rp.id_permiso = p.id_permiso
        WHERE rp.id_rol = ${user.id_rol} AND p.estado = true
      `;
      permisos = permisosUsuario.map((p) => p.nombre);
    }

    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        email: user.email,
        rol: user.id_rol,
        permisos,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    console.log("✅ Login exitoso para usuario:", email, "Rol:", user.id_rol);
    return res.json({ token });
  } catch (error) {
    console.error("💥 ERROR en login:", error);
    console.error("📋 Stack trace:", error.stack);
    return res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email es requerido" });

    const result = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
    if (result.length === 0) {
      return res.status(400).json({ message: "El email no está registrado" });
    }

    const user = result[0];
    if (user.estado === false || user.estado === 0) {
      return res.status(403).json({ message: "La cuenta está inactiva" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await sql`
      UPDATE usuarios 
      SET reset_token = ${token}, reset_token_expires = ${expires}
      WHERE id_usuario = ${user.id_usuario}
    `;

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/?token=${token}`;

    await brevoClient.transactionalEmails.sendTransacEmail({
      subject: "Recuperación de contraseña",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://rjrafmgjtuuqtprmfhwc.supabase.co/storage/v1/object/public/comprobantes/logo.png" alt="Glamour ML Logo" style="width: 80px; height: 80px; border-radius: 16px; background-color: #000;" />
          </div>
          <h2 style="color: #c47b96; text-align: center;">Recuperación de contraseña</h2>
          <p>Hola <strong>${user.nombre}</strong>,</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el botón a continuación para crear una nueva contraseña. El enlace es válido por 15 minutos.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background-color:#c47b96;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Restablecer Contraseña</a>
          </div>
          <p style="color: #666; font-size: 14px;">Si no solicitaste esto, puedes ignorar este correo.</p>
        </div>
      `,
      sender: { name: "Glamour ML", email: process.env.BREVO_SENDER_EMAIL || "tu-correo@gmail.com" },
      to: [{ email: email }],
    });

    return res.status(200).json({ message: "Correo de recuperación enviado" });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return res
      .status(500)
      .json({ message: "Error enviando correo de recuperación" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res
        .status(400)
        .json({ message: "Token y nueva contraseña son requeridos" });
    }

    if (
      new_password.length < 8 ||
      !/[a-z]/.test(new_password) ||
      !/[A-Z]/.test(new_password) ||
      !/[0-9]/.test(new_password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(new_password)
    ) {
      return res.status(400).json({
        message:
          "La contraseña debe tener al menos una mayúscula, un número y un carácter especial",
      });
    }

    const result = await sql`
      SELECT * FROM usuarios 
      WHERE reset_token = ${token} 
      AND reset_token_expires > NOW()
    `;

    if (result.length === 0) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    const user = result[0];
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await sql`
      UPDATE usuarios 
      SET password_hash = ${hashedPassword}, reset_token = NULL, reset_token_expires = NULL
      WHERE id_usuario = ${user.id_usuario}
    `;

    return res
      .status(200)
      .json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar la contraseña" });
  }
};
