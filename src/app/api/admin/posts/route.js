import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendNewPostNotification } from "@/lib/email";
import { logAudit } from "@/lib/audit";

// GET: Obtener todos los posts con información del creador
export async function GET() {
  try {
    const sql = getDb();
    const posts = await sql`
      SELECT
        p.*,
        m.name as created_by_member_name,
        m.avatar as created_by_member_avatar
      FROM posts p
      LEFT JOIN members m ON p.created_by_member_id = m.id
      ORDER BY p.created_at DESC
    `;
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Agregar/actualizar post
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_publish_blog) {
    return NextResponse.json({ error: "No tienes permisos para publicar blogs" }, { status: 403 });
  }

  try {
    const { id, tag, title, author, date, read_time, excerpt, content, image, media_type, video_url } = await request.json();
    const sql = getDb();

    // Get member_id from session
    let createdByMemberId = null;
    if (session.user?.discordId) {
      const member = await sql`SELECT id FROM members WHERE discord_id = ${session.user.discordId}`;
      if (member.length > 0) {
        createdByMemberId = member[0].id;
      }
    }

    let newPostId = null;
    let isNewPost = false;
    let oldPost = null;

    if (id) {
      // Obtener valores antiguos antes de actualizar
      const oldPostResult = await sql`SELECT * FROM posts WHERE id = ${id}`;
      oldPost = oldPostResult[0];

      // Actualizar
      await sql`
        UPDATE posts
        SET tag = ${tag}, title = ${title}, author = ${author},
            date = ${date}, read_time = ${read_time}, excerpt = ${excerpt},
            content = ${content}, image = ${image || null},
            media_type = ${media_type || 'image'},
            video_url = ${video_url || null},
            updated_at = NOW()
        WHERE id = ${id}
      `;

      // Obtener valores nuevos después de actualizar
      const updatedPostResult = await sql`SELECT * FROM posts WHERE id = ${id}`;
      const updatedPost = updatedPostResult[0];

      // Log audit
      await logAudit({
        action: "UPDATE",
        tableName: "posts",
        recordId: id,
        session,
        request,
        oldValues: oldPost,
        newValues: updatedPost,
        permissionUsed: permissions?.is_admin ? "is_admin" : "can_publish_blog",
      });
    } else {
      // Crear nuevo
      isNewPost = true;
      const result = await sql`
        INSERT INTO posts (tag, title, author, date, read_time, excerpt, content, image, media_type, video_url, created_by_member_id)
        VALUES (${tag}, ${title}, ${author}, ${date}, ${read_time}, ${excerpt}, ${content || ""}, ${image || null}, ${media_type || 'image'}, ${video_url || null}, ${createdByMemberId})
        RETURNING *
      `;
      newPostId = result[0].id;
      const newPost = result[0];

      // Log audit
      await logAudit({
        action: "CREATE",
        tableName: "posts",
        recordId: newPostId,
        session,
        request,
        newValues: newPost,
        permissionUsed: permissions?.is_admin ? "is_admin" : "can_publish_blog",
      });
    }

    // Si es un post nuevo, enviar notificaciones por email a todos los miembros
    if (isNewPost && newPostId) {
      try {
        // Obtener todos los miembros con email
        const membersWithEmail = await sql`
          SELECT name, email FROM members WHERE email IS NOT NULL AND email != ''
        `;

        if (membersWithEmail.length > 0) {
          console.log(`Enviando notificaciones de nuevo post a ${membersWithEmail.length} miembros...`);
          await sendNewPostNotification({
            recipients: membersWithEmail,
            postTitle: title,
            postExcerpt: excerpt,
            postId: newPostId,
            authorName: author
          });
        }
      } catch (emailError) {
        // No fallar la operación si el email falla
        console.error('Error enviando notificaciones de nuevo post:', emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar post
export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_publish_blog) {
    return NextResponse.json({ error: "No tienes permisos para eliminar blogs" }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    const sql = getDb();

    // Obtener post antes de eliminarlo
    const deletedPostResult = await sql`SELECT * FROM posts WHERE id = ${id}`;
    const deletedPost = deletedPostResult[0];

    await sql`DELETE FROM posts WHERE id = ${id}`;

    // Log audit
    await logAudit({
      action: "DELETE",
      tableName: "posts",
      recordId: id,
      session,
      request,
      oldValues: deletedPost,
      permissionUsed: permissions?.is_admin ? "is_admin" : "can_publish_blog",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
