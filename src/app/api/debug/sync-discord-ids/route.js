import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST() {
  try {
    const sql = getDb();

    // Sincronizar discord_id desde members a discord_authorized_users
    const result = await sql`
      UPDATE discord_authorized_users dau
      SET discord_id = m.discord_id, updated_at = NOW()
      FROM members m
      WHERE dau.discord_username = m.social_discord
        AND m.discord_id IS NOT NULL
        AND (dau.discord_id IS NULL OR dau.discord_id != m.discord_id)
      RETURNING dau.discord_username, dau.discord_id
    `;

    return NextResponse.json({
      success: true,
      updated: result.length,
      users: result
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
