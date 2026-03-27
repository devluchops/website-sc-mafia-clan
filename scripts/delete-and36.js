import { sql } from '@vercel/postgres';
import 'dotenv/config';

async function deleteUser() {
  try {
    console.log('🗑️  Eliminando usuario and36...');

    // Eliminar de user_permissions primero
    const permsDeleted = await sql`
      DELETE FROM user_permissions
      WHERE discord_username = 'and36' OR discord_id IN (
        SELECT discord_id FROM discord_authorized_users WHERE discord_username = 'and36'
      )
      RETURNING *
    `;
    console.log(`✅ Eliminados ${permsDeleted.length} registros de user_permissions`);

    // Eliminar de discord_authorized_users
    const usersDeleted = await sql`
      DELETE FROM discord_authorized_users
      WHERE discord_username = 'and36'
      RETURNING *
    `;
    console.log(`✅ Eliminados ${usersDeleted.length} registros de discord_authorized_users`);

    console.log('\n✅ Usuario and36 eliminado completamente');

    // Verificar que no quede nada
    const check = await sql`
      SELECT * FROM discord_authorized_users WHERE discord_username = 'and36'
    `;

    if (check.length === 0) {
      console.log('✅ Verificación: No hay registros de and36 en la base de datos');
    } else {
      console.log('⚠️  Advertencia: Todavía hay registros de and36');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

deleteUser();
