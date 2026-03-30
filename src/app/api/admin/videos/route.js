import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

// GET: Obtener todos los videos
export async function GET() {
  try {
    const sql = getDb();
    const videos = await sql`SELECT * FROM videos ORDER BY created_at DESC`;
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Agregar/actualizar video
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_publish_videos) {
    return NextResponse.json({ error: "No tienes permisos para publicar videos" }, { status: 403 });
  }

  try {
    const { id, title, duration, date, youtube_id, video_url } = await request.json();
    const sql = getDb();

    // Use video_url if provided, otherwise fallback to youtube_id format for backward compatibility
    const finalVideoUrl = video_url || (youtube_id ? `https://youtube.com/watch?v=${youtube_id}` : null);

    if (id) {
      // Actualizar
      await sql`
        UPDATE videos
        SET title = ${title}, duration = ${duration}, date = ${date},
            video_url = ${finalVideoUrl}, updated_at = NOW()
        WHERE id = ${id}
      `;
    } else {
      // Crear nuevo
      await sql`
        INSERT INTO videos (title, duration, date, video_url)
        VALUES (${title}, ${duration}, ${date}, ${finalVideoUrl})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar video
export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_publish_videos) {
    return NextResponse.json({ error: "No tienes permisos para eliminar videos" }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    const sql = getDb();

    await sql`DELETE FROM videos WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
