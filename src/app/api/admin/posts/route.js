import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

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

  try {
    const { id, tag, title, author, date, read_time, excerpt, content, image } = await request.json();
    const sql = getDb();

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
      await sql`
        INSERT INTO posts (tag, title, author, date, read_time, excerpt, content, image)
        VALUES (${tag}, ${title}, ${author}, ${date}, ${read_time}, ${excerpt}, ${content || ""}, ${image || null})
      `;
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

  try {
    const { id } = await request.json();
    const sql = getDb();

    await sql`DELETE FROM posts WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
