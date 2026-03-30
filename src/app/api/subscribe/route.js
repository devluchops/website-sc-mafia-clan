import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { email, name } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const existing = await sql`
      SELECT id, is_active FROM blog_subscribers WHERE email = ${email}
    `;

    if (existing.length > 0) {
      // Si ya existe pero está inactivo, reactivar
      if (!existing[0].is_active) {
        await sql`
          UPDATE blog_subscribers
          SET is_active = true,
              subscribed_at = NOW(),
              unsubscribed_at = NULL
          WHERE email = ${email}
        `;
        return NextResponse.json({
          message: 'Suscripción reactivada exitosamente'
        });
      }
      return NextResponse.json(
        { error: 'Este email ya está suscrito' },
        { status: 400 }
      );
    }

    // Crear nueva suscripción
    await sql`
      INSERT INTO blog_subscribers (email, name)
      VALUES (${email}, ${name || null})
    `;

    return NextResponse.json({
      message: 'Suscripción exitosa! Recibirás notificaciones de nuevos posts.'
    });

  } catch (error) {
    console.error('Error en suscripción:', error);
    return NextResponse.json(
      { error: 'Error al procesar suscripción' },
      { status: 500 }
    );
  }
}
