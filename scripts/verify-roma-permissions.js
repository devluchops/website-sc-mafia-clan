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
    console.log('Verificando permisos de Roma...\n');

    // Buscar en discord_authorized_users
    const [authUser] = await sql`
      SELECT * FROM discord_authorized_users
      WHERE discord_id = '758207301714182144'
    `;

    console.log('📋 Usuario Autorizado:');
    console.log('   Discord ID:', authUser?.discord_id || 'N/A');
    console.log('   Username:', authUser?.discord_username || 'N/A');

    // Buscar permisos
    const [permissions] = await sql`
      SELECT * FROM user_permissions
      WHERE discord_id = '758207301714182144'
    `;

    console.log('\n🔑 Permisos:');
    console.log('   is_admin:', permissions?.is_admin);
    console.log('   can_publish_blog:', permissions?.can_publish_blog);
    console.log('   can_publish_videos:', permissions?.can_publish_videos);
    console.log('   can_publish_events:', permissions?.can_publish_events);
    console.log('   can_edit_rules:', permissions?.can_edit_rules);
    console.log('   can_manage_members:', permissions?.can_manage_members);
    console.log('   can_manage_permissions:', permissions?.can_manage_permissions);

    // Verificar miembro
    const [member] = await sql`
      SELECT id, name, email, email_verified, discord_id, social_discord, invite_sent_at
      FROM members
      WHERE discord_id = '758207301714182144'
    `;

    console.log('\n👤 Datos del Miembro:');
    console.log('   ID:', member?.id);
    console.log('   Nombre:', member?.name);
    console.log('   Email:', member?.email);
    console.log('   Email Verificado:', member?.email_verified);
    console.log('   Invite Enviado:', member?.invite_sent_at || 'No');

    console.log('\n✅ Verificación completa');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
