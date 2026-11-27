import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST() {
  try {
    const sql = getDb();

    const discordId = "1158300711604473857";
    const username = "and36";

    // 1. Actualizar discord_id en discord_authorized_users
    await sql`
      UPDATE discord_authorized_users
      SET discord_id = ${discordId}, updated_at = NOW()
      WHERE discord_username = ${username}
    `;

    // 2. Verificar si ya tiene permisos
    const existing = await sql`
      SELECT * FROM user_permissions
      WHERE discord_id = ${discordId}
    `;

    if (existing.length === 0) {
      // 3. Crear permisos de admin
      await sql`
        INSERT INTO user_permissions (
          discord_id,
          is_admin,
          can_publish_blog,
          can_publish_videos,
          can_publish_events,
          can_edit_rules,
          can_manage_members,
          can_manage_permissions
        )
        VALUES (
          ${discordId},
          true,
          true,
          true,
          true,
          true,
          true,
          true
        )
      `;
    } else {
      // Si ya existe, actualizarlo a admin
      await sql`
        UPDATE user_permissions
        SET is_admin = true,
            can_publish_blog = true,
            can_publish_videos = true,
            can_publish_events = true,
            can_edit_rules = true,
            can_manage_members = true,
            can_manage_permissions = true,
            updated_at = NOW()
        WHERE discord_id = ${discordId}
      `;
    }

    // Verificar resultado
    const permissions = await sql`
      SELECT * FROM user_permissions
      WHERE discord_id = ${discordId}
    `;

    const authUser = await sql`
      SELECT * FROM discord_authorized_users
      WHERE discord_username = ${username}
    `;

    return NextResponse.json({
      success: true,
      message: "and36 configurado como admin",
      authUser: authUser[0],
      permissions: permissions[0],
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
