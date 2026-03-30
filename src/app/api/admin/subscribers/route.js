import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.permissions?.is_admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const subscribers = await sql`
      SELECT
        id,
        email,
        name,
        is_active,
        subscribed_at,
        unsubscribed_at,
        created_at
      FROM blog_subscribers
      ORDER BY created_at DESC
    `;

    const stats = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE is_active = false) as inactive
      FROM blog_subscribers
    `;

    return NextResponse.json({
      subscribers,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error obteniendo suscriptores:', error);
    return NextResponse.json(
      { error: 'Error al obtener suscriptores' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.permissions?.is_admin && !session?.user?.permissions?.can_publish_blog) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { id, is_active } = await request.json();

    await sql`
      UPDATE blog_subscribers
      SET is_active = ${is_active},
          unsubscribed_at = ${is_active ? null : new Date().toISOString()}
      WHERE id = ${id}
    `;

    return NextResponse.json({ message: 'Suscriptor actualizado' });
  } catch (error) {
    console.error('Error actualizando suscriptor:', error);
    return NextResponse.json(
      { error: 'Error al actualizar suscriptor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.permissions?.is_admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { id } = await request.json();

    await sql`
      DELETE FROM blog_subscribers WHERE id = ${id}
    `;

    return NextResponse.json({ message: 'Suscriptor eliminado' });
  } catch (error) {
    console.error('Error eliminando suscriptor:', error);
    return NextResponse.json(
      { error: 'Error al eliminar suscriptor' },
      { status: 500 }
    );
  }
}
