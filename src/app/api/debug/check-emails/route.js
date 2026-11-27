import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();

    // Mismo query que usa el panel de permisos
    const result = await sql`
      SELECT
        dau.discord_id,
        dau.discord_username,
        COALESCE(m.email, dau.email) as email,
        m.name as member_name
      FROM discord_authorized_users dau
      LEFT JOIN members m ON (
        dau.discord_id = m.discord_id OR
        dau.discord_username = m.social_discord
      )
      ORDER BY dau.discord_username
    `;

    return NextResponse.json({ users: result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
