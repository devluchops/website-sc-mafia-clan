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
    console.log('Buscando a Roma en la base de datos...');

    // Buscar miembro Roma
    const members = await sql`
      SELECT * FROM members WHERE name LIKE '%Roma%'
    `;

    if (members.length === 0) {
      console.log('❌ No se encontró ningún miembro con el nombre Roma');
      return;
    }

    const roma = members[0];
    console.log('✅ Miembro encontrado:', roma.name);
    console.log('   Discord: ', roma.social_discord || 'N/A');
    console.log('   Discord ID:', roma.discord_id || 'N/A');

    // Verificar si tiene discord configurado
    if (!roma.social_discord && !roma.discord_id) {
      console.log('⚠️  Roma no tiene Discord configurado');
      return;
    }

    // Buscar o crear en discord_authorized_users
    let authUser = await sql`
      SELECT * FROM discord_authorized_users
      WHERE discord_username = ${roma.social_discord || ''}
         OR discord_id = ${roma.discord_id || ''}
    `;

    if (authUser.length === 0 && roma.social_discord) {
      console.log('Creando usuario autorizado para Roma...');
      await sql`
        INSERT INTO discord_authorized_users (discord_username, discord_id)
        VALUES (${roma.social_discord}, ${roma.discord_id || null})
      `;
      authUser = await sql`
        SELECT * FROM discord_authorized_users WHERE discord_username = ${roma.social_discord}
      `;
    }

    if (authUser.length === 0) {
      console.log('❌ No se pudo crear el usuario autorizado');
      return;
    }

    const userId = authUser[0].discord_id || authUser[0].discord_username;

    // Verificar si ya tiene permisos
    const permissions = await sql`
      SELECT * FROM user_permissions
      WHERE discord_id = ${authUser[0].discord_id}
         OR discord_username = ${authUser[0].discord_username}
    `;

    if (permissions.length > 0) {
      // Actualizar permisos existentes
      console.log('Actualizando permisos existentes...');
      await sql`
        UPDATE user_permissions
        SET is_admin = true, updated_at = NOW()
        WHERE discord_id = ${authUser[0].discord_id}
           OR discord_username = ${authUser[0].discord_username}
      `;
    } else {
      // Crear nuevos permisos
      console.log('Creando permisos de administrador...');
      await sql`
        INSERT INTO user_permissions (
          discord_id,
          discord_username,
          is_admin,
          can_publish_blog,
          can_publish_videos,
          can_publish_events,
          can_edit_rules,
          can_manage_members,
          can_manage_permissions
        ) VALUES (
          ${authUser[0].discord_id || null},
          ${authUser[0].discord_username},
          true,
          true,
          true,
          true,
          true,
          true,
          true
        )
      `;
    }

    console.log('✅ Roma ahora es administrador con todos los permisos');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
