import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'and36';

  try {
    const sql = getDb();

    // Buscar en members
    const members = await sql`
      SELECT id, name, social_discord, discord_id, email
      FROM members
      WHERE social_discord ILIKE ${`%${username}%`} OR name ILIKE ${`%${username}%`}
    `;

    // Buscar en discord_authorized_users
    const authUsers = await sql`
      SELECT *
      FROM discord_authorized_users
      WHERE discord_username ILIKE ${`%${username}%`}
    `;

    // Buscar permisos
    let permissions = [];
    if (authUsers.length > 0) {
      const discordId = authUsers[0].discord_id;
      permissions = await sql`
        SELECT *
        FROM user_permissions
        WHERE discord_id = ${discordId}
      `;
    }

    return NextResponse.json({
      username,
      members,
      authUsers,
      permissions,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
