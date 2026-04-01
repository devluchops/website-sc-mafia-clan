import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/audit";

// GET: Obtener todos los eventos
export async function GET() {
  try {
    const sql = getDb();
    const events = await sql`SELECT * FROM events ORDER BY created_at DESC`;
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Agregar/actualizar evento
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_publish_events) {
    return NextResponse.json({ error: "No tienes permisos para publicar eventos" }, { status: 403 });
  }

  try {
    const { id, month, day, title, description, status } = await request.json();
    const sql = getDb();

    if (id) {
      // Obtener valores antiguos antes de actualizar
      const oldEventResult = await sql`SELECT * FROM events WHERE id = ${id}`;
      const oldEvent = oldEventResult[0];

      // Actualizar
      await sql`
        UPDATE events
        SET month = ${month}, day = ${day}, title = ${title},
            description = ${description}, status = ${status}, updated_at = NOW()
        WHERE id = ${id}
      `;

      // Obtener valores nuevos después de actualizar
      const updatedEventResult = await sql`SELECT * FROM events WHERE id = ${id}`;
      const updatedEvent = updatedEventResult[0];

      // Log audit
      await logAudit({
        action: "UPDATE",
        tableName: "events",
        recordId: id,
        session,
        request,
        oldValues: oldEvent,
        newValues: updatedEvent,
        permissionUsed: permissions?.is_admin ? "is_admin" : "can_publish_events",
      });
    } else {
      // Crear nuevo
      const result = await sql`
        INSERT INTO events (month, day, title, description, status)
        VALUES (${month}, ${day}, ${title}, ${description}, ${status})
        RETURNING *
      `;
      const newEvent = result[0];

      // Log audit
      await logAudit({
        action: "CREATE",
        tableName: "events",
        recordId: newEvent.id,
        session,
        request,
        newValues: newEvent,
        permissionUsed: permissions?.is_admin ? "is_admin" : "can_publish_events",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar evento
export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_publish_events) {
    return NextResponse.json({ error: "No tienes permisos para eliminar eventos" }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    const sql = getDb();

    // Obtener evento antes de eliminarlo
    const deletedEventResult = await sql`SELECT * FROM events WHERE id = ${id}`;
    const deletedEvent = deletedEventResult[0];

    await sql`DELETE FROM events WHERE id = ${id}`;

    // Log audit
    await logAudit({
      action: "DELETE",
      tableName: "events",
      recordId: id,
      session,
      request,
      oldValues: deletedEvent,
      permissionUsed: permissions?.is_admin ? "is_admin" : "can_publish_events",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
