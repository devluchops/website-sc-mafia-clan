import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendNewPostNotification } from "@/lib/email";

// GET: Obtener todos los posts
export async function GET() {
  try {
    const sql = getDb();
    const posts = await sql`SELECT * FROM posts ORDER BY created_at DESC`;
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
    const { id, tag, title, author, date, read_time, excerpt, content, image } = await request.json();
    const sql = getDb();

    let newPostId = null;
    let isNewPost = false;

    if (id) {
      // Actualizar
      await sql`
        UPDATE posts
        SET tag = ${tag}, title = ${title}, author = ${author},
            date = ${date}, read_time = ${read_time}, excerpt = ${excerpt},
            content = ${content}, image = ${image || null}, updated_at = NOW()
        WHERE id = ${id}
      `;
    } else {
      // Crear nuevo
      isNewPost = true;
      const result = await sql`
        INSERT INTO posts (tag, title, author, date, read_time, excerpt, content, image)
        VALUES (${tag}, ${title}, ${author}, ${date}, ${read_time}, ${excerpt}, ${content || ""}, ${image || null})
        RETURNING id
      `;
      newPostId = result[0].id;
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

    await sql`DELETE FROM posts WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
