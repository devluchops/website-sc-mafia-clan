import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE blog_subscribers
      SET is_active = false,
          unsubscribed_at = NOW()
      WHERE email = ${email} AND is_active = true
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Email no encontrado o ya desuscrito' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Te has desuscrito exitosamente'
    });

  } catch (error) {
    console.error('Error al desuscribir:', error);
    return NextResponse.json(
      { error: 'Error al procesar solicitud' },
      { status: 500 }
    );
  }
}
