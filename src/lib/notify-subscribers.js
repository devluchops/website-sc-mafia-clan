import { Resend } from 'resend';
import { neon } from '@neondatabase/serverless';

const resend = new Resend(process.env.RESEND_API_KEY);
const sql = neon(process.env.DATABASE_URL);

export async function notifySubscribers(post) {
  try {
    // Obtener todos los suscriptores activos
    const subscribers = await sql`
      SELECT email, name FROM blog_subscribers WHERE is_active = true
    `;

    if (subscribers.length === 0) {
      console.log('No hay suscriptores activos');
      return { sent: 0 };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const postUrl = `${siteUrl}/post/${post.id}`;
    const unsubscribeUrl = `${siteUrl}/unsubscribe`;

    // Template del email
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1e1b18; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #252220;">
    <!-- Header -->
    <tr>
      <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #3d3525 0%, #1e1b18 100%);">
        <h1 style="color: #c9a84c; margin: 0; font-size: 28px; font-family: 'Cinzel', serif;">CLAN MAFIA</h1>
        <p style="color: #8b7b5e; margin: 10px 0 0 0; font-size: 14px;">Nuevo Post Publicado</p>
      </td>
    </tr>

    <!-- Post Image -->
    ${post.image ? `
    <tr>
      <td style="padding: 0;">
        <img src="${post.image.startsWith('http') ? post.image : siteUrl + post.image}" alt="${post.title}" style="width: 100%; height: auto; display: block;">
      </td>
    </tr>
    ` : ''}

    <!-- Content -->
    <tr>
      <td style="padding: 30px;">
        <h2 style="color: #e8dcc0; margin: 0 0 15px 0; font-size: 24px;">${post.title}</h2>
        <p style="color: #d4c5a0; line-height: 1.6; margin: 0 0 20px 0; font-size: 15px;">${post.excerpt}</p>

        <table cellpadding="0" cellspacing="0" style="margin: 0;">
          <tr>
            <td style="background-color: #c9a84c; border-radius: 6px; text-align: center;">
              <a href="${postUrl}" style="display: inline-block; padding: 12px 30px; color: #1e1b18; text-decoration: none; font-weight: bold; font-size: 16px;">Leer Post Completo</a>
            </td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #3d3525;">
          <p style="color: #8b7b5e; font-size: 12px; margin: 0;">
            📅 ${post.date} • ⏱️ ${post.read_time || 1} min lectura • 🏷️ ${post.tag}
          </p>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 30px; background-color: #1e1b18; text-align: center;">
        <p style="color: #8b7b5e; font-size: 12px; margin: 0 0 10px 0;">
          Recibiste este email porque estás suscrito a las notificaciones del blog de Clan MAFIA
        </p>
        <a href="${unsubscribeUrl}" style="color: #c9a84c; text-decoration: none; font-size: 12px;">Desuscribirse</a>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Enviar emails en batch (para evitar rate limits)
    const batchSize = 50;
    let sent = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      const emailPromises = batch.map(subscriber =>
        resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: subscriber.email,
          subject: `📰 Nuevo Post: ${post.title}`,
          html: emailHtml,
        })
      );

      await Promise.allSettled(emailPromises);
      sent += batch.length;

      // Pequeño delay entre batches
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ Notificaciones enviadas a ${sent} suscriptores`);
    return { sent };

  } catch (error) {
    console.error('Error notificando suscriptores:', error);
    throw error;
  }
}
