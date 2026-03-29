const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('DATABASE_URL=')[1].replace(/^["']|["']$/g, '').trim();

const sql = neon(dbUrl);

async function sendVerificationToRoma() {
  try {
    console.log('📧 Enviando email de verificación a Roma...\n');

    // Buscar Roma
    const [roma] = await sql`
      SELECT * FROM members WHERE discord_id = '758207301714182144'
    `;

    if (!roma) {
      console.log('❌ Roma no encontrado');
      return;
    }

    if (!roma.email) {
      console.log('❌ Roma no tiene email configurado');
      return;
    }

    if (!roma.social_discord) {
      console.log('❌ Roma no tiene Discord configurado');
      return;
    }

    console.log('👤 Enviando a:', roma.name);
    console.log('📧 Email:', roma.email);
    console.log('💬 Discord:', roma.social_discord);
    console.log();

    // Generar token de verificación
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await sql`
      UPDATE members
      SET verification_token = ${token},
          verification_token_expires = ${expiresAt.toISOString()}
      WHERE id = ${roma.id}
    `;

    console.log('✅ Token de verificación generado');
    console.log('   Expira en:', expiresAt.toLocaleString('es-ES'));
    console.log();

    // Enviar email con Resend
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Clan MAFIA <onboarding@resend.dev>';
    const verificationUrl = `${SITE_URL}/api/verify-token?token=${token}`;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: roma.email,
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
              .info-box {
                background-color: #3d2a1a;
                border-left: 4px solid #d97706;
                padding: 16px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .info-box p {
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
                <h1>CLAN MAFIA</h1>
              </div>
              <div class="content">
                <h2>¡Hola ${roma.name}! 👋</h2>
                <p>
                  Te damos la bienvenida al sitio oficial del <strong>Clan MAFIA</strong>.
                  Para activar tu cuenta, primero verifica tu email haciendo clic en el botón de abajo.
                  Luego podrás iniciar sesión con Discord:
                </p>
                <center>
                  <a href="${verificationUrl}" class="button">✓ Verificar Email y Continuar</a>
                </center>
                <div class="info-box">
                  <p>
                    ⏰ <strong>Este link expira en 24 horas.</strong><br>
                    Después de verificar tu email, podrás iniciar sesión con Discord.
                  </p>
                </div>
                <p>
                  Una vez dentro podrás:
                </p>
                <ul>
                  <li>Ver y comentar en el blog del clan</li>
                  <li>Actualizar tu perfil y redes sociales</li>
                  <li>Ver eventos y videos</li>
                  <li>Acceder al panel de administración</li>
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

    // Actualizar invite_sent_at
    await sql`
      UPDATE members
      SET invite_sent_at = NOW()
      WHERE id = ${roma.id}
    `;

    console.log('✅ Email enviado exitosamente!');
    console.log('   Email ID:', result.id);
    console.log('   Enviado a:', roma.email);
    console.log();
    console.log('📋 Próximos pasos:');
    console.log('   1. Revisa tu inbox: lvalencia1286@gmail.com');
    console.log('   2. Haz clic en "✓ Verificar Email y Continuar"');
    console.log('   3. Serás redirigido a /login con mensaje de éxito');
    console.log('   4. Haz clic en "Iniciar sesión con Discord"');
    console.log('   5. ¡Acceso completo al sitio! 🎉');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

sendVerificationToRoma();
