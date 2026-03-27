import { sql } from '@vercel/postgres';

async function addColumn() {
  try {
    console.log('🔧 Agregando columna discord_username a user_permissions...');

    // Agregar columna si no existe
    await sql`
      ALTER TABLE user_permissions
      ADD COLUMN IF NOT EXISTS discord_username VARCHAR(255)
    `;

    console.log('✅ Columna discord_username agregada exitosamente');

    // Poblar la columna con datos de discord_authorized_users
    await sql`
      UPDATE user_permissions up
      SET discord_username = dau.discord_username
      FROM discord_authorized_users dau
      WHERE up.discord_id = dau.discord_id
      AND up.discord_username IS NULL
    `;

    console.log('✅ Datos poblados correctamente');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addColumn();
