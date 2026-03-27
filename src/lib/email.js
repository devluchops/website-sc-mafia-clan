import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Configuración de emails
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Clan MAFIA <onboarding@resend.dev>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Envía un email de invitación a un miembro del clan
 */
export async function sendInviteEmail(member) {
  if (!member.email) {
    throw new Error('El miembro no tiene email configurado');
  }

  const inviteUrl = `${SITE_URL}/login`;

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
                  Para acceder al sitio, simplemente inicia sesión con tu cuenta de Discord:
                </p>
                <center>
                  <a href="${inviteUrl}" class="button">Iniciar Sesión con Discord</a>
                </center>
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
