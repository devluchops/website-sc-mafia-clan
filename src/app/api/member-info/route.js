import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const discordId = searchParams.get("discordId");

    if (!discordId) {
      return NextResponse.json({ error: "Discord ID requerido" }, { status: 400 });
    }

    const sql = getDb();
    const [member] = await sql`
      SELECT id, name, email, phone, email_verified, discord_id, social_discord
      FROM members
      WHERE discord_id = ${discordId}
    `;

    if (!member) {
      return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      emailVerified: member.email_verified,
      discordId: member.discord_id,
      discordUsername: member.social_discord,
    });
  } catch (error) {
    console.error("Error fetching member info:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
