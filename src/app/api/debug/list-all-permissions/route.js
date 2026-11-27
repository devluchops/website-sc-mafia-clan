import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();

    // Obtener TODOS los permisos
    const allPermissions = await sql`
      SELECT
        up.*,
        dau.discord_username,
        m.name as member_name
      FROM user_permissions up
      LEFT JOIN discord_authorized_users dau ON up.discord_id = dau.discord_id
      LEFT JOIN members m ON up.discord_id = m.discord_id
      ORDER BY up.discord_id, up.id
    `;

    return NextResponse.json({
      total: allPermissions.length,
      permissions: allPermissions
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
