import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sql from "../config/db.js";
import crypto from "crypto";
import * as emailService from "../services/email.service.js";

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

    // Generar código de verificación de 6 dígitos
    const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Insertar en usuario_verificaciones
    await sql`
      INSERT INTO usuario_verificaciones (id_usuario, codigo_verificacion, email_verificado)
      VALUES (${result[0].id_usuario}, ${codigoVerificacion}, false)
    `;

    // Enviar correo con código de verificación
    emailService.enviarCodigoVerificacion(email, nombre, codigoVerificacion).catch(e => console.error("💥 Error email verificación:", e));

    return res.status(201).json({
      message: "Usuario registrado correctamente. Por favor verifica tu correo.",
      usuario: result[0],
      requiresVerification: true
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

    // ── Verificar correo ──
    const [verificacion] = await sql`SELECT email_verificado FROM usuario_verificaciones WHERE id_usuario = ${user.id_usuario}`;
    // Si existe el registro de verificación y no está verificado, denegar acceso
    if (verificacion && !verificacion.email_verificado) {
      console.log("❌ Usuario no ha verificado su correo:", email);
      return res.status(403).json({
        code: "EMAIL_NOT_VERIFIED",
        message: "Por favor verifica tu correo electrónico para poder iniciar sesión.",
      });
    }

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

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await sql`
      UPDATE usuarios 
      SET reset_token = ${code}, reset_token_expires = ${expires}
      WHERE id_usuario = ${user.id_usuario}
    `;

    await emailService.enviarCodigoCambioPassword({ email, nombre: user.nombre, codigo: code });

    return res.status(200).json({ message: "Código de recuperación enviado" });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return res
      .status(500)
      .json({ message: "Error enviando código de recuperación" });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email y código son requeridos" });
    }

    const result = await sql`
      SELECT * FROM usuarios 
      WHERE email = ${email.trim()} 
      AND reset_token = ${code.trim()} 
      AND reset_token_expires > NOW()
    `;

    if (result.length === 0) {
      return res.status(400).json({ ok: false, message: "Código inválido o expirado" });
    }

    return res.status(200).json({ ok: true, message: "Código verificado" });
  } catch (error) {
    console.error("Error en verifyResetCode:", error);
    return res.status(500).json({ message: "Error en el servidor" });
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

    return res.status(200).json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("💥 ERROR en resetPassword:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "Email y código son requeridos" });
    const [user] = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    const [verificacion] = await sql`SELECT * FROM usuario_verificaciones WHERE id_usuario = ${user.id_usuario}`;
    if (!verificacion) return res.status(400).json({ message: "No se encontró proceso de verificación" });
    if (verificacion.email_verificado) return res.status(400).json({ message: "El correo ya está verificado" });
    if (verificacion.codigo_verificacion !== code) return res.status(400).json({ message: "Código de verificación incorrecto" });
    await sql`UPDATE usuario_verificaciones SET email_verificado = true, codigo_verificacion = NULL WHERE id_usuario = ${user.id_usuario}`;
    let permisos = [];
    if (user.id_rol === 1) {
      const todos = await sql`SELECT nombre FROM permisos WHERE estado = true`;
      permisos = todos.map(p => p.nombre);
    } else {
      const userPerms = await sql`SELECT p.nombre FROM roles_permisos rp JOIN permisos p ON rp.id_permiso = p.id_permiso WHERE rp.id_rol = ${user.id_rol} AND p.estado = true`;
      permisos = userPerms.map(p => p.nombre);
    }
    const token = jwt.sign({ id_usuario: user.id_usuario, email: user.email, rol: user.id_rol, permisos }, process.env.JWT_SECRET, { expiresIn: "24h" });
    emailService.enviarBienvenida(user.email, user.nombre).catch(e => console.error("💥 Error email bienvenida:", e));
    return res.json({ message: "Correo verificado exitosamente", token, usuario: { id_usuario: user.id_usuario, nombre: user.nombre, apellido: user.apellido, email: user.email, id_rol: user.id_rol, estado: user.estado, permisos } });
  } catch (error) {
    console.error("💥 ERROR en verifyEmail:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};

export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ registered: false, message: "Email es requerido" });
    const result = await sql`SELECT id_usuario FROM usuarios WHERE email = ${email.trim()}`;
    return res.status(200).json({ registered: result.length > 0 });
  } catch (error) {
    console.error("Error en checkEmail:", error);
    return res.status(500).json({ registered: false, message: "Error en el servidor" });
  }
};