import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

// GET: Obtener todos los miembros
export async function GET() {
  try {
    const sql = getDb();
    const members = await sql`SELECT * FROM members ORDER BY created_at DESC`;
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Agregar/actualizar miembro
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_manage_members) {
    return NextResponse.json({ error: "No tienes permisos para gestionar miembros" }, { status: 403 });
  }

  try {
    const {
      id, name, race, rank, avatar, mmr,
      main_race, races_played, level_rank,
      protoss_level, terran_level, zerg_level,
      social_facebook, social_discord, social_tiktok,
      social_kick, social_instagram, social_twitter, social_youtube
    } = await request.json();
    const sql = getDb();

    if (id) {
      // Actualizar
      await sql`
        UPDATE members
        SET name = ${name}, race = ${main_race || race || 'Terran'}, rank = ${rank},
            avatar = ${avatar}, mmr = ${mmr},
            main_race = ${main_race || race || 'Terran'},
            races_played = ${races_played || race || 'Terran'},
            level_rank = ${level_rank || 'B'},
            protoss_level = ${protoss_level || '-'},
            terran_level = ${terran_level || '-'},
            zerg_level = ${zerg_level || '-'},
            social_facebook = ${social_facebook || ''},
            social_discord = ${social_discord || ''},
            social_tiktok = ${social_tiktok || ''},
            social_kick = ${social_kick || ''},
            social_instagram = ${social_instagram || ''},
            social_twitter = ${social_twitter || ''},
            social_youtube = ${social_youtube || ''},
            updated_at = NOW()
        WHERE id = ${id}
      `;
    } else {
      // Crear nuevo
      await sql`
        INSERT INTO members (
          name, race, rank, avatar, mmr,
          main_race, races_played, level_rank,
          protoss_level, terran_level, zerg_level,
          social_facebook, social_discord, social_tiktok,
          social_kick, social_instagram, social_twitter, social_youtube
        )
        VALUES (
          ${name}, ${main_race || race || 'Terran'}, ${rank}, ${avatar}, ${mmr},
          ${main_race || race || 'Terran'}, ${races_played || race || 'Terran'}, ${level_rank || 'B'},
          ${protoss_level || '-'}, ${terran_level || '-'}, ${zerg_level || '-'},
          ${social_facebook || ''}, ${social_discord || ''}, ${social_tiktok || ''},
          ${social_kick || ''}, ${social_instagram || ''}, ${social_twitter || ''}, ${social_youtube || ''}
        )
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar miembro
export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_manage_members) {
    return NextResponse.json({ error: "No tienes permisos para eliminar miembros" }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    const sql = getDb();

    await sql`DELETE FROM members WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
