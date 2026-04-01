import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/audit";

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

    let oldVideo = null;

    if (id) {
      // Obtener valores antiguos antes de actualizar
      const oldVideoResult = await sql`SELECT * FROM videos WHERE id = ${id}`;
      oldVideo = oldVideoResult[0];

      // Actualizar
      await sql`
        UPDATE videos
        SET title = ${title}, duration = ${duration}, date = ${date},
            video_url = ${finalVideoUrl}, updated_at = NOW()
        WHERE id = ${id}
      `;

      // Obtener valores nuevos después de actualizar
      const updatedVideoResult = await sql`SELECT * FROM videos WHERE id = ${id}`;
      const updatedVideo = updatedVideoResult[0];

      // Log audit
      await logAudit({
        action: "UPDATE",
        tableName: "videos",
        recordId: id,
        session,
        request,
        oldValues: oldVideo,
        newValues: updatedVideo,
        permissionUsed: permissions?.is_admin ? "is_admin" : "can_publish_videos",
      });
    } else {
      // Crear nuevo
      const result = await sql`
        INSERT INTO videos (title, duration, date, video_url)
        VALUES (${title}, ${duration}, ${date}, ${finalVideoUrl})
        RETURNING *
      `;
      const newVideo = result[0];

      // Log audit
      await logAudit({
        action: "CREATE",
        tableName: "videos",
        recordId: newVideo.id,
        session,
        request,
        newValues: newVideo,
        permissionUsed: permissions?.is_admin ? "is_admin" : "can_publish_videos",
      });
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

    // Obtener video antes de eliminarlo
    const deletedVideoResult = await sql`SELECT * FROM videos WHERE id = ${id}`;
    const deletedVideo = deletedVideoResult[0];

    await sql`DELETE FROM videos WHERE id = ${id}`;

    // Log audit
    await logAudit({
      action: "DELETE",
      tableName: "videos",
      recordId: id,
      session,
      request,
      oldValues: deletedVideo,
      permissionUsed: permissions?.is_admin ? "is_admin" : "can_publish_videos",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
