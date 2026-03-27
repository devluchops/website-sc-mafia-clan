import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendCommentReplyNotification } from "@/lib/email";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Obtener comentarios de un post
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: "postId requerido" }, { status: 400 });
    }

    const sql = getDb();

    // Obtener todos los comentarios del post (incluyendo respuestas)
    const comments = await sql`
      SELECT
        bc.*,
        m.name as member_name,
        m.avatar as member_avatar,
        m.rank as member_rank,
        m.level_rank as member_level
      FROM blog_comments bc
      LEFT JOIN members m ON bc.discord_username = m.social_discord
      WHERE bc.post_id = ${postId}
      ORDER BY bc.created_at ASC
    `;

    // Organizar comentarios en estructura jerárquica
    const commentMap = {};
    const rootComments = [];

    comments.forEach(comment => {
      commentMap[comment.id] = {
        ...comment,
        replies: []
      };
    });

    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        if (commentMap[comment.parent_comment_id]) {
          commentMap[comment.parent_comment_id].replies.push(commentMap[comment.id]);
        }
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return NextResponse.json(rootComments);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return NextResponse.json({ error: "Error al obtener comentarios" }, { status: 500 });
  }
}

// POST - Crear un comentario
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { postId, content, parentCommentId } = body;

    if (!postId || !content) {
      return NextResponse.json({ error: "postId y content son requeridos" }, { status: 400 });
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: "El comentario no puede estar vacío" }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "El comentario es demasiado largo (máximo 1000 caracteres)" }, { status: 400 });
    }

    const sql = getDb();

    // Crear el comentario
    const [newComment] = await sql`
      INSERT INTO blog_comments (
        post_id,
        parent_comment_id,
        discord_id,
        discord_username,
        content
      ) VALUES (
        ${postId},
        ${parentCommentId || null},
        ${session.user.id || null},
        ${session.user.name || session.user.email},
        ${content.trim()}
      )
      RETURNING *
    `;

    // Si es una respuesta a otro comentario, enviar notificación por email
    if (parentCommentId) {
      try {
        // Obtener el comentario padre
        const [parentComment] = await sql`
          SELECT bc.*, m.email, m.name as member_name
          FROM blog_comments bc
          LEFT JOIN members m ON bc.discord_id = m.discord_id OR bc.discord_username = m.social_discord
          WHERE bc.id = ${parentCommentId}
        `;

        // Obtener el post para el título
        const [post] = await sql`
          SELECT title FROM posts WHERE id = ${postId}
        `;

        // Obtener info del autor de la respuesta
        const [replyAuthor] = await sql`
          SELECT name FROM members
          WHERE discord_id = ${session.user.discordId}
             OR social_discord = ${session.user.name}
          LIMIT 1
        `;

        // Si el autor del comentario padre tiene email y no es el mismo que responde, enviar notificación
        if (parentComment?.email && parentComment.discord_id !== session.user.discordId) {
          await sendCommentReplyNotification({
            authorEmail: parentComment.email,
            authorName: parentComment.member_name || parentComment.discord_username,
            replyAuthorName: replyAuthor?.name || session.user.name,
            postTitle: post?.title || 'Post del Blog',
            postId: postId,
            commentContent: content.trim()
          });
          console.log(`✅ Notificación enviada a ${parentComment.email}`);
        }
      } catch (emailError) {
        // No fallar la operación si el email falla
        console.error('Error enviando notificación de respuesta:', emailError);
      }
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error al crear comentario:", error);
    return NextResponse.json({ error: "Error al crear comentario" }, { status: 500 });
  }
}

// DELETE - Eliminar un comentario (solo el autor o admin)
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: "commentId requerido" }, { status: 400 });
    }

    const sql = getDb();

    // Verificar si el comentario existe y si el usuario es el autor o admin
    const [comment] = await sql`
      SELECT * FROM blog_comments WHERE id = ${commentId}
    `;

    if (!comment) {
      return NextResponse.json({ error: "Comentario no encontrado" }, { status: 404 });
    }

    const isAuthor = comment.discord_username === session.user.name || comment.discord_id === session.user.id;
    const isAdmin = session.user.permissions?.is_admin;

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "No tienes permiso para eliminar este comentario" }, { status: 403 });
    }

    // Eliminar el comentario (las respuestas se eliminan en cascada)
    await sql`DELETE FROM blog_comments WHERE id = ${commentId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    return NextResponse.json({ error: "Error al eliminar comentario" }, { status: 500 });
  }
}
