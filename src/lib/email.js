import { Resend } from 'resend';

// Inicializar Resend solo si está configurado
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// Configuración de emails
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Clan MAFIA <onboarding@resend.dev>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Envía un email de invitación a un miembro del clan
 * @param {Object} member - Datos del miembro
 * @param {string} verificationToken - Token de verificación (opcional, si no se incluye solo invita a login)
 */
export async function sendInviteEmail(member, verificationToken = null) {
  if (!resend) {
    console.warn('⚠️  Resend no está configurado. No se enviará el email.');
    return null;
  }

  if (!member.email) {
    throw new Error('El miembro no tiene email configurado');
  }

  // Si hay token, usar link de verificación; si no, link de login
  const inviteUrl = verificationToken
    ? `${SITE_URL}/api/verify-token?token=${verificationToken}`
    : `${SITE_URL}/login`;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: member.email,
      subject: '¡Bienvenido al Clan MAFIA! 🎮',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #0a0a0a;
                color: #e8dcc0;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #1e1b18;
                border: 1px solid #3d3525;
                border-radius: 10px;
                overflow: hidden;
              }
              .header {
                background-color: #252220;
                padding: 30px;
                text-align: center;
                border-bottom: 2px solid #c9a84c;
              }
              .header h1 {
                color: #c9a84c;
                font-size: 32px;
                margin: 0;
                letter-spacing: 4px;
                font-weight: 700;
              }
              .content {
                padding: 40px 30px;
              }
              .content h2 {
                color: #c9a84c;
                font-size: 24px;
                margin-top: 0;
              }
              .content p {
                line-height: 1.6;
                color: #e8dcc0;
                margin: 16px 0;
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background-color: #c9a84c;
                color: #1e1b18;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                letter-spacing: 1.5px;
                text-transform: uppercase;
              }
              .button:hover {
                background-color: #d4b660;
              }
              .info-box {
                background-color: #252220;
                border-left: 4px solid #c9a84c;
                padding: 16px;
                margin: 20px 0;
              }
              .footer {
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
                color: #8b7b5e;
                border-top: 1px solid #3d3525;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>CLAN MAFIA</h1>
              </div>
              <div class="content">
                <h2>¡Hola ${member.name}! 👋</h2>
                <p>
                  Te damos la bienvenida al sitio oficial del <strong>Clan MAFIA</strong>.
                  Ahora puedes acceder a nuestro portal para ver contenido exclusivo,
                  participar en discusiones y estar al día con las novedades del clan.
                </p>
                <div class="info-box">
                  <p style="margin: 0;">
                    <strong>Tu Discord:</strong> ${member.social_discord || 'No configurado'}<br>
                    <strong>Rango:</strong> ${member.rank}<br>
                    <strong>Nivel:</strong> ${member.level_rank || 'B'}
                  </p>
                </div>
                <p>
                  ${verificationToken
                    ? 'Para activar tu cuenta, primero verifica tu email haciendo clic en el botón de abajo. Luego podrás iniciar sesión con Discord:'
                    : 'Para acceder al sitio, simplemente inicia sesión con tu cuenta de Discord:'}
                </p>
                <center>
                  <a href="${inviteUrl}" class="button">${verificationToken ? '✓ Verificar Email y Continuar' : 'Iniciar Sesión con Discord'}</a>
                </center>
                ${verificationToken ? `
                <div class="info-box" style="background-color: #3d2a1a; border-left: 4px solid #d97706;">
                  <p style="margin: 0; color: #fbbf24; font-size: 14px;">
                    ⏰ <strong>Este link expira en 24 horas.</strong><br>
                    Después de verificar tu email, podrás iniciar sesión con Discord.
                  </p>
                </div>
                ` : ''}
                <p>
                  Una vez dentro podrás:
                </p>
                <ul>
                  <li>Ver y comentar en el blog del clan</li>
                  <li>Actualizar tu perfil y redes sociales</li>
                  <li>Ver eventos y videos</li>
                  <li>Conocer las reglas y miembros del clan</li>
                </ul>
                <p style="margin-top: 30px; color: #8b7b5e; font-size: 14px;">
                  ¡Nos vemos en el juego! 🎮
                </p>
              </div>
              <div class="footer">
                <p>Este email fue enviado porque eres miembro del Clan MAFIA.</p>
                <p>© ${new Date().getFullYear()} Clan MAFIA - StarCraft Community</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Email de invitación enviado a:', member.email);
    return data;
  } catch (error) {
    console.error('❌ Error enviando email de invitación:', error);
    throw error;
  }
}

/**
 * Envía notificación de nuevo post del blog a todos los miembros
 */
export async function sendNewPostNotification({
  recipients,
  postTitle,
  postExcerpt,
  postId,
  authorName
}) {
  if (!resend) {
    console.warn('⚠️  Resend no está configurado. No se enviarán emails de nuevos posts.');
    return null;
  }

  if (!recipients || recipients.length === 0) {
    console.log('No hay destinatarios para enviar notificación de nuevo post');
    return;
  }

  const postUrl = `${SITE_URL}/#blog-${postId}`;

  try {
    // Enviar email a cada destinatario
    const promises = recipients.map(async (recipient) => {
      if (!recipient.email) return null;

      try {
        return await resend.emails.send({
          from: FROM_EMAIL,
          to: recipient.email,
          subject: `Nuevo post del blog: ${postTitle}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #0a0a0a;
                    color: #e8dcc0;
                    margin: 0;
                    padding: 20px;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #1e1b18;
                    border: 1px solid #3d3525;
                    border-radius: 10px;
                    overflow: hidden;
                  }
                  .header {
                    background-color: #252220;
                    padding: 30px;
                    text-align: center;
                    border-bottom: 2px solid #c9a84c;
                  }
                  .header h1 {
                    color: #c9a84c;
                    font-size: 28px;
                    margin: 0;
                    letter-spacing: 3px;
                  }
                  .content {
                    padding: 40px 30px;
                  }
                  .content h2 {
                    color: #c9a84c;
                    font-size: 24px;
                    margin-top: 0;
                    line-height: 1.3;
                  }
                  .content p {
                    line-height: 1.6;
                    color: #e8dcc0;
                    margin: 16px 0;
                  }
                  .author {
                    color: #8b7b5e;
                    font-size: 14px;
                    margin-bottom: 20px;
                  }
                  .excerpt {
                    background-color: #252220;
                    border-left: 4px solid #c9a84c;
                    padding: 16px;
                    margin: 20px 0;
                    border-radius: 4px;
                    font-style: italic;
                    color: #d4c4a8;
                  }
                  .button {
                    display: inline-block;
                    padding: 14px 32px;
                    background-color: #c9a84c;
                    color: #1e1b18;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                  }
                  .footer {
                    padding: 20px 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #8b7b5e;
                    border-top: 1px solid #3d3525;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>📝 Nuevo Post</h1>
                  </div>
                  <div class="content">
                    <h2>${postTitle}</h2>
                    <p class="author">Publicado por <strong>${authorName}</strong></p>
                    ${postExcerpt ? `<div class="excerpt">${postExcerpt}</div>` : ''}
                    <p>
                      Un nuevo post ha sido publicado en el blog del Clan MAFIA.
                      Lee el artículo completo y comparte tus comentarios.
                    </p>
                    <center>
                      <a href="${postUrl}" class="button">Leer Post Completo</a>
                    </center>
                  </div>
                  <div class="footer">
                    <p>Recibes este email porque eres miembro del Clan MAFIA.</p>
                    <p>© ${new Date().getFullYear()} Clan MAFIA</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
      } catch (error) {
        console.error(`Error enviando a ${recipient.email}:`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`✅ Notificaciones de nuevo post enviadas: ${successful}/${recipients.length}`);

    return results;
  } catch (error) {
    console.error('❌ Error enviando notificaciones de nuevo post:', error);
    throw error;
  }
}

/**
 * Envía notificación cuando alguien responde a un comentario
 */
export async function sendCommentReplyNotification({
  authorEmail,
  authorName,
  replyAuthorName,
  postTitle,
  postId,
  commentContent
}) {
  if (!resend) {
    console.warn('⚠️  Resend no está configurado. No se enviará notificación de respuesta.');
    return null;
  }

  if (!authorEmail) {
    throw new Error('El autor del comentario no tiene email configurado');
  }

  const commentUrl = `${SITE_URL}/#blog-${postId}`;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: authorEmail,
      subject: `${replyAuthorName} respondió a tu comentario en "${postTitle}"`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #0a0a0a;
                color: #e8dcc0;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #1e1b18;
                border: 1px solid #3d3525;
                border-radius: 10px;
                overflow: hidden;
              }
              .header {
                background-color: #252220;
                padding: 30px;
                text-align: center;
                border-bottom: 2px solid #c9a84c;
              }
              .header h1 {
                color: #c9a84c;
                font-size: 28px;
                margin: 0;
                letter-spacing: 3px;
              }
              .content {
                padding: 40px 30px;
              }
              .content h2 {
                color: #c9a84c;
                font-size: 20px;
                margin-top: 0;
              }
              .content p {
                line-height: 1.6;
                color: #e8dcc0;
                margin: 16px 0;
              }
              .comment-box {
                background-color: #252220;
                border-left: 4px solid #c9a84c;
                padding: 16px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .comment-box .author {
                color: #c9a84c;
                font-weight: 600;
                margin-bottom: 8px;
              }
              .comment-box .text {
                color: #e8dcc0;
                line-height: 1.5;
              }
              .button {
                display: inline-block;
                padding: 14px 32px;
                background-color: #c9a84c;
                color: #1e1b18;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                letter-spacing: 1.5px;
                text-transform: uppercase;
              }
              .footer {
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
                color: #8b7b5e;
                border-top: 1px solid #3d3525;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Nueva Respuesta 💬</h1>
              </div>
              <div class="content">
                <h2>¡Hola ${authorName}!</h2>
                <p>
                  <strong>${replyAuthorName}</strong> ha respondido a tu comentario en
                  <strong>"${postTitle}"</strong>:
                </p>
                <div class="comment-box">
                  <div class="author">${replyAuthorName}</div>
                  <div class="text">${commentContent}</div>
                </div>
                <center>
                  <a href="${commentUrl}" class="button">Ver Comentario</a>
                </center>
                <p style="margin-top: 30px; color: #8b7b5e; font-size: 14px;">
                  Puedes responder directamente en el sitio web.
                </p>
              </div>
              <div class="footer">
                <p>Recibes este email porque alguien respondió a tu comentario.</p>
                <p>© ${new Date().getFullYear()} Clan MAFIA</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Notificación de respuesta enviada a:', authorEmail);
    return data;
  } catch (error) {
    console.error('❌ Error enviando notificación de respuesta:', error);
    throw error;
  }
}

/**
 * Envía email de verificación de cuenta
 */
export async function sendVerificationEmail({ email, name, token }) {
  if (!resend) {
    console.warn('⚠️  Resend no está configurado. No se enviará email de verificación.');
    return null;
  }

  if (!email) {
    throw new Error('Email no proporcionado para verificación');
  }

  const verificationUrl = `${SITE_URL}/api/verify-token?token=${token}`;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verifica tu email - Clan MAFIA 🔐',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #0a0a0a;
                color: #e8dcc0;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #1e1b18;
                border: 1px solid #3d3525;
                border-radius: 10px;
                overflow: hidden;
              }
              .header {
                background-color: #252220;
                padding: 30px;
                text-align: center;
                border-bottom: 2px solid #c9a84c;
              }
              .header h1 {
                color: #c9a84c;
                font-size: 32px;
                margin: 0;
                letter-spacing: 4px;
                font-weight: 700;
              }
              .content {
                padding: 40px 30px;
              }
              .content h2 {
                color: #c9a84c;
                font-size: 24px;
                margin-top: 0;
              }
              .content p {
                line-height: 1.6;
                color: #e8dcc0;
                margin: 16px 0;
              }
              .button {
                display: inline-block;
                padding: 16px 40px;
                background-color: #c9a84c;
                color: #1e1b18;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 700;
                margin: 24px 0;
                letter-spacing: 2px;
                text-transform: uppercase;
                font-size: 16px;
              }
              .button:hover {
                background-color: #d4b660;
              }
              .warning {
                background-color: #3d2a1a;
                border-left: 4px solid #d97706;
                padding: 16px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .warning p {
                margin: 0;
                color: #fbbf24;
                font-size: 14px;
              }
              .footer {
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
                color: #8b7b5e;
                border-top: 1px solid #3d3525;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 VERIFICA TU EMAIL</h1>
              </div>
              <div class="content">
                <h2>¡Hola ${name}!</h2>
                <p>
                  Gracias por unirte al <strong>Clan MAFIA</strong>. Para completar tu registro
                  y acceder a todas las funciones del sitio, necesitamos verificar tu dirección
                  de email.
                </p>
                <p>
                  Haz click en el botón de abajo para verificar tu cuenta:
                </p>
                <center>
                  <a href="${verificationUrl}" class="button">✓ Verificar Email</a>
                </center>
                <div class="warning">
                  <p>
                    ⏰ <strong>Este link expira en 24 horas.</strong><br>
                    Si no verificas tu email en este tiempo, deberás solicitar un nuevo link de verificación.
                  </p>
                </div>
                <p style="color: #8b7b5e; font-size: 14px; margin-top: 30px;">
                  Si no creaste una cuenta en Clan MAFIA, puedes ignorar este email.
                </p>
                <p style="color: #8b7b5e; font-size: 12px; margin-top: 20px;">
                  Si el botón no funciona, copia y pega este link en tu navegador:<br>
                  <span style="color: #c9a84c; word-break: break-all;">${verificationUrl}</span>
                </p>
              </div>
              <div class="footer">
                <p>Este email fue enviado automáticamente por el sistema de verificación.</p>
                <p>© ${new Date().getFullYear()} Clan MAFIA - StarCraft Community</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Email de verificación enviado a:', email);
    return data;
  } catch (error) {
    console.error('❌ Error enviando email de verificación:', error);
    throw error;
  }
}

/**
 * Envía notificación al administrador cuando alguien solicita unirse al clan
 */
export async function sendJoinRequestNotification({
  name,
  tag,
  email,
  phone,
  race,
  discord,
  reason
}) {
  if (!resend) {
    console.warn('⚠️  Resend no está configurado. No se enviará notificación de solicitud.');
    return null;
  }

  const adminEmail = 'lvalencia1286@gmail.com';

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `🎮 Nueva solicitud de unión al clan: ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #0a0a0a;
                color: #e8dcc0;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #1e1b18;
                border: 1px solid #3d3525;
                border-radius: 10px;
                overflow: hidden;
              }
              .header {
                background-color: #252220;
                padding: 30px;
                text-align: center;
                border-bottom: 2px solid #c9a84c;
              }
              .header h1 {
                color: #c9a84c;
                font-size: 28px;
                margin: 0;
                letter-spacing: 3px;
              }
              .content {
                padding: 40px 30px;
              }
              .content h2 {
                color: #c9a84c;
                font-size: 22px;
                margin-top: 0;
              }
              .content p {
                line-height: 1.6;
                color: #e8dcc0;
                margin: 16px 0;
              }
              .info-grid {
                background-color: #252220;
                border: 1px solid #3d3525;
                border-radius: 6px;
                padding: 20px;
                margin: 20px 0;
              }
              .info-row {
                display: flex;
                padding: 10px 0;
                border-bottom: 1px solid #3d3525;
              }
              .info-row:last-child {
                border-bottom: none;
              }
              .info-label {
                color: #8b7b5e;
                font-weight: 600;
                min-width: 120px;
                font-size: 14px;
              }
              .info-value {
                color: #e8dcc0;
                flex: 1;
                font-size: 14px;
              }
              .reason-box {
                background-color: #252220;
                border-left: 4px solid #c9a84c;
                padding: 16px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .reason-box p {
                margin: 0;
                color: #e8dcc0;
                line-height: 1.6;
                font-style: italic;
              }
              .footer {
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
                color: #8b7b5e;
                border-top: 1px solid #3d3525;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎮 Nueva Solicitud</h1>
              </div>
              <div class="content">
                <h2>Solicitud de unión al clan</h2>
                <p>
                  Un nuevo jugador ha completado el formulario de solicitud para unirse al Clan MAFIA.
                </p>

                <div class="info-grid">
                  <div class="info-row">
                    <div class="info-label">Nombre:</div>
                    <div class="info-value"><strong>${name}</strong></div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Nickname Player:</div>
                    <div class="info-value"><strong>${tag}</strong></div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Email:</div>
                    <div class="info-value"><a href="mailto:${email}" style="color: #c9a84c; text-decoration: none;">${email}</a></div>
                  </div>
                  ${phone ? `
                  <div class="info-row">
                    <div class="info-label">WhatsApp:</div>
                    <div class="info-value"><a href="https://wa.me/${phone.replace(/\D/g, '')}" style="color: #c9a84c; text-decoration: none;">${phone}</a></div>
                  </div>
                  ` : ''}
                  <div class="info-row">
                    <div class="info-label">Raza principal:</div>
                    <div class="info-value"><strong>${race}</strong></div>
                  </div>
                  ${discord ? `
                  <div class="info-row">
                    <div class="info-label">Discord:</div>
                    <div class="info-value">${discord}</div>
                  </div>
                  ` : ''}
                </div>

                <p style="color: #c9a84c; font-weight: 600; margin-top: 30px; margin-bottom: 10px;">
                  ¿Por qué quiere unirse al clan?
                </p>
                <div class="reason-box">
                  <p>${reason}</p>
                </div>

                <p style="margin-top: 30px; color: #8b7b5e; font-size: 14px;">
                  Puedes contactar al solicitante por email o WhatsApp para coordinar su ingreso al clan.
                </p>
              </div>
              <div class="footer">
                <p>Esta notificación fue generada automáticamente por el sitio web del Clan MAFIA.</p>
                <p>© ${new Date().getFullYear()} Clan MAFIA - StarCraft Community</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Notificación de solicitud enviada al administrador');
    return data;
  } catch (error) {
    console.error('❌ Error enviando notificación de solicitud:', error);
    throw error;
  }
}
