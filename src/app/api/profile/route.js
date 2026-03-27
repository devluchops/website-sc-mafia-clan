import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    console.log("=== Profile GET Debug ===");
    console.log("Session exists:", !!session);
    console.log("User:", session?.user);
    console.log("Discord ID:", session?.user?.discordId);
    console.log("========================");

    if (!session?.user) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const sql = getDb();

    // Get member data linked to this Discord user
    // Try by discord_id first, then by discord_username (from social_discord)
    let members = [];

    if (session.user.discordId) {
      members = await sql`
        SELECT * FROM members WHERE discord_id = ${session.user.discordId}
      `;
    }

    // If not found by discord_id, try by discord username
    if (members.length === 0 && session.user.name) {
      members = await sql`
        SELECT * FROM members WHERE social_discord = ${session.user.name}
      `;
    }

    if (members.length === 0) {
      console.log("No member found for user:", session.user);
      return Response.json({
        error: "Tu cuenta de Discord no está vinculada a ningún miembro del clan. Contacta al administrador.",
        user: session.user
      }, { status: 404 });
    }

    return Response.json({ member: members[0] });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const sql = getDb();

    // Get member ID for this Discord user
    let members = [];

    if (session.user.discordId) {
      members = await sql`
        SELECT id FROM members WHERE discord_id = ${session.user.discordId}
      `;
    }

    // If not found by discord_id, try by discord username
    if (members.length === 0 && session.user.name) {
      members = await sql`
        SELECT id FROM members WHERE social_discord = ${session.user.name}
      `;
    }

    if (members.length === 0) {
      return Response.json({ error: "Miembro no encontrado" }, { status: 404 });
    }

    const memberId = members[0].id;
    const {
      about_me,
      avatar,
      social_facebook,
      social_discord,
      social_tiktok,
      social_kick,
      social_instagram,
      social_twitter,
      social_youtube,
    } = await request.json();

    // Update only allowed fields
    await sql`
      UPDATE members
      SET
        about_me = ${about_me || null},
        avatar = ${avatar || null},
        social_facebook = ${social_facebook || null},
        social_discord = ${social_discord || null},
        social_tiktok = ${social_tiktok || null},
        social_kick = ${social_kick || null},
        social_instagram = ${social_instagram || null},
        social_twitter = ${social_twitter || null},
        social_youtube = ${social_youtube || null},
        updated_at = NOW()
      WHERE id = ${memberId}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
