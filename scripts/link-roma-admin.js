const { neon } = require("@neondatabase/serverless");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL no está definida en .env.local");
  process.exit(1);
}

async function linkRomaAdmin() {
  const sql = neon(DATABASE_URL);

  const discordId = "758207301714182144";
  const discordUsername = "lucho264849";
  const email = "lvalencia1286@gmail.com";

  console.log("=== Vinculando Roma como Admin ===");

  try {
    // 1. Actualizar miembro Roma con discord_id
    console.log("1. Actualizando miembro Roma...");
    const memberName = "MAFIA]`Roma";
    const updateMember = await sql`
      UPDATE members
      SET discord_id = ${discordId}, updated_at = NOW()
      WHERE name = ${memberName}
      RETURNING id, name, discord_id
    `;
    console.log("   ✅ Miembro actualizado:", updateMember[0]);

    // 2. Actualizar discord_authorized_users con discord_id real
    console.log("2. Actualizando usuario autorizado...");
    const updateAuth = await sql`
      UPDATE discord_authorized_users
      SET discord_id = ${discordId}, updated_at = NOW()
      WHERE discord_username = ${discordUsername}
      RETURNING id, discord_username, discord_id
    `;
    console.log("   ✅ Usuario autorizado actualizado:", updateAuth[0]);

    // 3. Crear o actualizar permisos de admin
    console.log("3. Configurando permisos de admin...");
    const existingPerms = await sql`
      SELECT * FROM user_permissions WHERE discord_id = ${discordId}
    `;

    if (existingPerms.length > 0) {
      // Actualizar permisos existentes
      await sql`
        UPDATE user_permissions
        SET
          member_id = ${updateMember[0].id},
          is_admin = true,
          can_publish_blog = true,
          can_publish_videos = true,
          can_publish_events = true,
          can_edit_rules = true,
          can_manage_members = true,
          can_manage_permissions = true,
          updated_at = NOW()
        WHERE discord_id = ${discordId}
      `;
      console.log("   ✅ Permisos actualizados");
    } else {
      // Crear nuevos permisos
      await sql`
        INSERT INTO user_permissions (
          discord_id,
          member_id,
          is_admin,
          can_publish_blog,
          can_publish_videos,
          can_publish_events,
          can_edit_rules,
          can_manage_members,
          can_manage_permissions
        ) VALUES (
          ${discordId},
          ${updateMember[0].id},
          true,
          true,
          true,
          true,
          true,
          true,
          true
        )
      `;
      console.log("   ✅ Permisos creados");
    }

    // 4. Verificar resultado final
    console.log("\n=== Verificación Final ===");
    const finalCheck = await sql`
      SELECT
        m.name,
        m.discord_id,
        m.rank,
        up.is_admin,
        up.can_manage_permissions
      FROM members m
      LEFT JOIN user_permissions up ON m.discord_id = up.discord_id
      WHERE m.discord_id = ${discordId}
    `;
    console.log("Resultado:", finalCheck[0]);
    console.log("\n✅ ¡Roma vinculado como Admin exitosamente!");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

linkRomaAdmin();
