import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { notifySubscribers } from '@/lib/notify-subscribers';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.permissions?.is_admin &&
      !session?.user?.permissions?.can_publish_blog) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { postId } = await request.json();

    // Obtener datos del post
    const posts = await sql`
      SELECT id, title, excerpt, image, date, tag, read_time
      FROM posts
      WHERE id = ${postId}
    `;

    if (posts.length === 0) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
    }

    // Enviar notificaciones
    const result = await notifySubscribers(posts[0]);

    return NextResponse.json({
      success: true,
      message: `✅ Notificaciones enviadas a ${result.sent} suscriptores`
    });
  } catch (error) {
    console.error('Error enviando notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al enviar notificaciones: ' + error.message },
      { status: 500 }
    );
  }
}
