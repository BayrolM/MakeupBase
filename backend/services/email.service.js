import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { BrevoClient } = require("@getbrevo/brevo");

// ── Configuración de Brevo ─────────────────────────────────────────
const brevoClient = new BrevoClient({ apiKey: process.env.BREVO_API_KEY || "" });

const LOGO_URL = "https://rjrafmgjtuuqtprmfhwc.supabase.co/storage/v1/object/public/comprobantes/logo.png";
const SENDER = { name: "Glamour ML", email: process.env.BREVO_SENDER_EMAIL || "noreply@glamourml.com" };
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ── Helpers de formato ─────────────────────────────────────────────
const formatCOP = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(v || 0);

/**
 * Genera el HTML completo de un email con header, body y footer consistentes.
 */
function buildEmail(title, bodyHtml) {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fdf5f8; border-radius: 12px; border: 1px solid #f0d5e0; overflow: hidden;">
    <div style="text-align: center; background-color: #2e1020; padding: 28px 20px;">
      <img src="${LOGO_URL}" alt="Glamour ML" style="width: 72px; height: 72px; border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />
      <h1 style="color: #fff; margin: 12px 0 0; font-size: 24px; letter-spacing: 2px;">GLAMOUR ML</h1>
      <p style="color: #e092b2; font-size: 11px; margin: 4px 0 0; letter-spacing: 1px;">TIENDA DE BELLEZA &amp; CUIDADO PERSONAL</p>
    </div>
    <div style="padding: 32px 28px; background-color: #fff;">
      <h2 style="color: #c47b96; text-align: center; font-size: 22px; margin: 0 0 20px;">${title}</h2>
      ${bodyHtml}
      <p style="color: #999; font-size: 13px; margin-top: 32px; text-align: center; border-top: 1px solid #f0d5e0; padding-top: 18px;">
        Con cariño,<br/>
        <strong style="color: #2e1020; font-size: 14px;">El equipo de Glamour ML</strong>
      </p>
    </div>
  </div>`;
}

function buildButton(text, url) {
  return `
  <div style="text-align: center; margin: 28px 0;">
    <a href="${url}" style="display: inline-block; padding: 13px 30px; background: linear-gradient(135deg, #c47b96 0%, #a85d77 100%); color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 14px rgba(196,123,150,0.35);">${text}</a>
  </div>`;
}

function infoTable(rows) {
  const rowsHtml = rows
    .filter((r) => r.value)
    .map(
      (r) => `
      <tr>
        <td style="padding: 10px 12px; color: #888; font-size: 14px; border-bottom: 1px solid #f5f0f2;">${r.label}</td>
        <td style="padding: 10px 12px; color: #2e1020; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #f5f0f2;">${r.value}</td>
      </tr>`,
    )
    .join("");
  return `
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #fdf8fa; border-radius: 8px; overflow: hidden; border: 1px solid #f0e4e8;">
    ${rowsHtml}
  </table>`;
}

// ── Envío base ─────────────────────────────────────────────────────
async function sendEmail(toEmail, toName, subject, htmlContent) {
  try {
    const data = await brevoClient.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      sender: SENDER,
      to: [{ email: toEmail, name: toName || "" }],
    });
    console.log(`✉️  Email "${subject}" → ${toEmail} (ID: ${data?.messageId || 'OK'})`);
  } catch (error) {
    console.error(`💥 Error al enviar email "${subject}" a ${toEmail}:`, error);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  EMAILS PÚBLICOS
// ═══════════════════════════════════════════════════════════════════

/**
 * 1. Email de bienvenida (registro de cliente)
 */
export async function enviarBienvenida(email, nombre) {
  const body = `
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">¡Hola, <strong>${nombre}</strong>! ✨</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Estamos muy felices de darte la bienvenida a <strong>Glamour ML</strong>.</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Tu cuenta ha sido creada exitosamente. A partir de ahora podrás explorar nuestro catálogo completo de belleza, realizar pedidos rápidos de tus productos favoritos y llevar un registro detallado de todas tus compras.</p>
    ${buildButton("Explorar el Catálogo", FRONTEND_URL + "/")}
  `;
  await sendEmail(email, nombre, "¡Bienvenida a Glamour ML! 💖", buildEmail("¡Bienvenida a Glamour ML! 💖", body));
}

/**
 * 2. Email de recuperación de contraseña
 */
export async function enviarRecuperacion(email, nombre, resetLink) {
  const body = `
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Hola <strong>${nombre}</strong>,</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Has solicitado restablecer tu contraseña. Haz clic en el botón a continuación para crear una nueva contraseña. El enlace es válido por 15 minutos.</p>
    ${buildButton("Restablecer Contraseña", resetLink)}
    <p style="color: #999; font-size: 13px;">Si no solicitaste esto, puedes ignorar este correo.</p>
  `;
  await sendEmail(email, nombre, "Recuperación de contraseña", buildEmail("Recuperación de contraseña 🔐", body));
}

/**
 * 2b. Código de Cambio de Contraseña
 */
export async function enviarCodigoCambioPassword({ email, nombre, codigo }) {
  const body = `
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">¡Hola, <strong>${nombre || "Cliente"}</strong>!</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Has solicitado cambiar tu contraseña. Usa el siguiente código de 6 dígitos para verificar que eres tú:</p>
    <div style="background-color: #fce8f0; padding: 24px; text-align: center; border-radius: 12px; margin: 24px 0; border: 2px dashed #e092b2;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2e1020;">${codigo}</span>
    </div>
    <p style="color: #999; font-size: 13px;">Este código expirará en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo.</p>
  `;
  await sendEmail(email, nombre, "Código para cambiar tu contraseña 🔒", buildEmail("Cambio de contraseña", body));
}

/**
 * 3. Confirmación de pedido (al crear)
 */
export async function enviarConfirmacionPedido({ email, nombre, idPedido, total, direccion }) {
  const body = `
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">¡Hola, <strong>${nombre || "Cliente"}</strong>!</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Hemos recibido tu pedido correctamente. Lo procesaremos lo antes posible.</p>
    ${infoTable([
      { label: "N° de Pedido", value: "#" + idPedido },
      { label: "Total", value: formatCOP(total) },
      { label: "Dirección de envío", value: direccion || "N/A" },
    ])}
    ${buildButton("Ver mi pedido", FRONTEND_URL + "/")}
    <p style="color: #999; font-size: 13px; text-align: center;">Recuerda subir tu comprobante de pago para agilizar el proceso.</p>
  `;
  await sendEmail(email, nombre, "¡Pedido #" + idPedido + " recibido! 📦", buildEmail("¡Pedido recibido! 📦", body));
}

/**
 * 4. Pago confirmado
 */
export async function enviarPagoConfirmado({ email, nombre, idPedido, total }) {
  const body = `
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">¡Hola, <strong>${nombre || "Cliente"}</strong>!</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Tu pago ha sido verificado y confirmado exitosamente. ¡Pronto comenzaremos a preparar tu pedido!</p>
    ${infoTable([
      { label: "N° de Pedido", value: "#" + idPedido },
      { label: "Monto confirmado", value: formatCOP(total) },
    ])}
    ${buildButton("Ver mi pedido", FRONTEND_URL + "/")}
  `;
  await sendEmail(email, nombre, "Pago confirmado - Pedido #" + idPedido + " 💳", buildEmail("¡Pago confirmado! 💳", body));
}

/**
 * 4a. Pedido Procesando
 */
export async function enviarPedidoProcesando({ email, nombre, idPedido }) {
  const body = `
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">¡Hola, <strong>${nombre || "Cliente"}</strong>!</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Tu pedido <strong>#${idPedido}</strong> ha entrado en la fase de procesamiento. ⚙️</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Nuestro equipo está revisando los detalles para asegurar que todo esté perfecto antes de comenzar a prepararlo.</p>
    ${buildButton("Ver mi pedido", FRONTEND_URL + "/")}
  `;
  await sendEmail(email, nombre, "Pedido #" + idPedido + " en proceso ⚙️", buildEmail("¡Tu pedido está siendo procesado!", body));
}

/**
 * 4b. Pedido Preparado
 */
export async function enviarPedidoPreparado({ email, nombre, idPedido }) {
  const body = `
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">¡Hola, <strong>${nombre || "Cliente"}</strong>!</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">¡Excelentes noticias! Tu pedido <strong>#${idPedido}</strong> ya ha sido empacado y está preparado. 🎁</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Pronto será despachado y te enviaremos otro correo con la información de rastreo.</p>
    ${buildButton("Ver mi pedido", FRONTEND_URL + "/")}
  `;
  await sendEmail(email, nombre, "¡Tu pedido #" + idPedido + " está listo! 🎁", buildEmail("¡Tu pedido está preparado!", body));
}

/**
 * 5. Pedido enviado
 */
export async function enviarPedidoEnviado({ email, nombre, idPedido, transportadora, numeroGuia, trackingLink, fechaEstimada }) {
  const rows = [
    { label: "N° de Pedido", value: "#" + idPedido },
    { label: "Transportadora", value: transportadora || "N/A" },
    { label: "N° de Guía", value: numeroGuia || "N/A" },
  ];
  if (fechaEstimada) rows.push({ label: "Fecha estimada", value: fechaEstimada });

  const btnUrl = trackingLink || FRONTEND_URL + "/";
  const btnText = trackingLink ? "Rastrear mi envío" : "Ver mi pedido";

  const body = `
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">¡Hola, <strong>${nombre || "Cliente"}</strong>!</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">¡Tu pedido ya va en camino! 🎉 Aquí tienes los datos de tu envío:</p>
    ${infoTable(rows)}
    ${buildButton(btnText, btnUrl)}
    <p style="color: #999; font-size: 13px; text-align: center;">Puedes rastrear tu envío con el número de guía proporcionado.</p>
  `;
  await sendEmail(email, nombre, "¡Tu pedido #" + idPedido + " va en camino! 🚚", buildEmail("¡Tu pedido va en camino! 🚚", body));
}

/**
 * 6. Pedido entregado
 */
export async function enviarPedidoEntregado({ email, nombre, idPedido }) {
  const body = `
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">¡Hola, <strong>${nombre || "Cliente"}</strong>!</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Tu pedido <strong>#${idPedido}</strong> ha sido entregado exitosamente. 🎉</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">¡Esperamos que disfrutes tus productos! Gracias por confiar en <strong>Glamour ML</strong>.</p>
    ${buildButton("Ver mis pedidos", FRONTEND_URL + "/")}
    <p style="color: #999; font-size: 13px; text-align: center;">Si necesitas realizar alguna devolución, puedes hacerlo desde la sección "Mis Pedidos" dentro de los 45 días siguientes.</p>
  `;
  await sendEmail(email, nombre, "¡Pedido #" + idPedido + " entregado! ✅", buildEmail("¡Pedido entregado! ✅", body));
}

/**
 * 7. Pedido cancelado
 */
export async function enviarPedidoCancelado({ email, nombre, idPedido, motivo }) {
  const body = `
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Hola, <strong>${nombre || "Cliente"}</strong>,</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Lamentamos informarte que tu pedido ha sido cancelado.</p>
    ${infoTable([
      { label: "N° de Pedido", value: "#" + idPedido },
      { label: "Motivo", value: motivo || "No especificado" },
    ])}
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Si tienes alguna duda o deseas realizar un nuevo pedido, estamos aquí para ayudarte.</p>
    ${buildButton("Visitar la tienda", FRONTEND_URL + "/")}
  `;
  await sendEmail(email, nombre, "Pedido #" + idPedido + " cancelado ❌", buildEmail("Pedido cancelado", body));
}

/**
 * 8. Código de verificación (registro)
 */
export async function enviarCodigoVerificacion(email, nombre, codigo) {
  const body = `
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">¡Hola, <strong>${nombre || "Usuario"}</strong>!</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Gracias por registrarte en <strong>Glamour ML</strong>. Para activar tu cuenta, por favor ingresa el siguiente código de verificación de 6 dígitos en la página de registro:</p>
    <div style="background-color: #fce8f0; border: 2px dashed #c47b96; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
      <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #7b1347;">${codigo}</span>
    </div>
    <p style="color: #999; font-size: 13px; text-align: center;">Si no creaste esta cuenta, puedes ignorar este correo de forma segura.</p>
  `;
  await sendEmail(email, nombre, "Tu código de verificación - Glamour ML 🔐", buildEmail("Verifica tu correo electrónico", body));
}

// ═══════════════════════════════════════════════════════════════════
//  EMAILS DE DEVOLUCIONES
// ═══════════════════════════════════════════════════════════════════

/**
 * Devolución aprobada
 */
export async function enviarDevolucionAprobada({ email, nombre, idDevolucion, idVenta, totalDevuelto }) {
  const rows = [
    { label: "N° Devolución", value: "#" + idDevolucion },
    { label: "N° Venta", value: "#" + idVenta },
    { label: "Total devuelto", value: formatCOP(totalDevuelto) },
  ];

  const body = `
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">¡Hola, <strong>${nombre || "Cliente"}</strong>!</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Tu solicitud de devolución ha sido <strong style="color: #16a34a;">aprobada</strong>. ✅</p>
    ${infoTable(rows)}
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">El monto será reembolsado según el método de pago original. Si tienes alguna duda, contáctanos.</p>
    ${buildButton("Ver mis devoluciones", FRONTEND_URL + "/")}
  `;
  await sendEmail(email, nombre, "Devolución #" + idDevolucion + " aprobada ✅", buildEmail("Devolución aprobada", body));
}

/**
 * Devolución rechazada
 */
export async function enviarDevolucionRechazada({ email, nombre, idDevolucion, idVenta, motivoDecision }) {
  const rows = [
    { label: "N° Devolución", value: "#" + idDevolucion },
    { label: "N° Venta", value: "#" + idVenta },
    { label: "Motivo del rechazo", value: motivoDecision || "No especificado" },
  ];

  const body = `
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Hola, <strong>${nombre || "Cliente"}</strong>,</p>
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Lamentamos informarte que tu solicitud de devolución ha sido <strong style="color: #dc2626;">rechazada</strong>. ❌</p>
    ${infoTable(rows)}
    <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">Si tienes alguna duda o deseas presentar un reclamo, no dudes en contactarnos.</p>
    ${buildButton("Contactar soporte", FRONTEND_URL + "/")}
  `;
  await sendEmail(email, nombre, "Devolución #" + idDevolucion + " rechazada ❌", buildEmail("Devolución rechazada", body));
}
