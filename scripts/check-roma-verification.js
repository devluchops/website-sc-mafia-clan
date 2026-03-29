const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('DATABASE_URL=')[1].replace(/^["']|["']$/g, '').trim();

const sql = neon(dbUrl);

(async () => {
  try {
    console.log('Verificando estado completo de Roma...\n');

    const [member] = await sql`
      SELECT
        id, name, email, email_verified,
        verification_token, verification_token_expires,
        invite_sent_at, last_login_at,
        discord_id, social_discord
      FROM members
      WHERE discord_id = '758207301714182144'
    `;

    if (!member) {
      console.log('❌ Roma no encontrado');
      return;
    }

    console.log('👤 Datos de Roma:');
    console.log('   ID:', member.id);
    console.log('   Nombre:', member.name);
    console.log('   Email:', member.email);
    console.log('   Discord:', member.social_discord);
    console.log('   Discord ID:', member.discord_id);
    console.log('\n📧 Estado de Email:');
    console.log('   Email verificado:', member.email_verified);
    console.log('   Invite enviado:', member.invite_sent_at || 'No');
    console.log('   Último ingreso:', member.last_login_at || 'Nunca');
    console.log('\n🔑 Token de Verificación:');
    console.log('   Token:', member.verification_token || 'No generado');
    console.log('   Expira:', member.verification_token_expires || 'N/A');

    if (member.verification_token_expires) {
      const expiresDate = new Date(member.verification_token_expires);
      const now = new Date();
      const isExpired = expiresDate < now;
      console.log('   Estado:', isExpired ? '❌ EXPIRADO' : '✅ Válido');
      console.log('   Tiempo restante:', isExpired ? 'Expirado' : `${Math.round((expiresDate - now) / 1000 / 60)} minutos`);
    }

    console.log('\n💡 Diagnóstico:');
    if (!member.verification_token) {
      console.log('   ⚠️  No se ha generado un token de verificación');
      console.log('   ℹ️  Roma debe ir a /verify-email y hacer clic en "Reenviar Código"');
    } else if (member.verification_token_expires && new Date(member.verification_token_expires) < new Date()) {
      console.log('   ⚠️  El token ha expirado');
      console.log('   ℹ️  Roma debe solicitar un nuevo código desde /verify-email');
    } else {
      console.log('   ✅ Token válido generado');
      console.log('   ℹ️  Roma debe revisar su email y hacer clic en el link de verificación');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
