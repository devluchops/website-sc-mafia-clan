import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { sendPushToAll } from "@/lib/push";

const MONTHS_ES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];

// Añade las columnas nuevas del calendario si no existen (idempotente)
async function ensureEventsColumns(sql) {
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_date DATE`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_time VARCHAR(20)`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type VARCHAR(40) DEFAULT 'evento'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS link TEXT`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS remind_before_min INTEGER DEFAULT 0`;
}

// Deriva month/day (texto, formato viejo) a partir de una fecha ISO (YYYY-MM-DD)
function deriveMonthDay(eventDate) {
  if (!eventDate) return { month: null, day: null };
  const d = new Date(eventDate + "T00:00:00");
  if (isNaN(d.getTime())) return { month: null, day: null };
  return { month: MONTHS_ES[d.getMonth()], day: String(d.getDate()) };
}

const TYPE_LABELS = {
  showmatch: "Showmatch",
  partida: "Partida",
  torneo: "Torneo",
  reunion: "Reunión",
  anuncio: "Anuncio",
  evento: "Evento",
};

// GET: Obtener todos los eventos
export async function GET() {
  try {
    const sql = getDb();
    await ensureEventsColumns(sql);
    const events = await sql`SELECT * FROM events ORDER BY event_date ASC NULLS LAST, created_at DESC`;
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
    const body = await request.json();
    const {
      id,
      title,
      description,
      status,
      event_date = null,
      event_time = null,
      event_type = "evento",
      link = null,
      remind_before_min = 0,
    } = body;

    const sql = getDb();
    await ensureEventsColumns(sql);

    // month/day: respeta los enviados (formato viejo) o los deriva de la fecha
    const derived = deriveMonthDay(event_date);
    const month = body.month ?? derived.month;
    const day = body.day ?? derived.day;

    if (id) {
      const oldEventResult = await sql`SELECT * FROM events WHERE id = ${id}`;
      const oldEvent = oldEventResult[0];

      await sql`
        UPDATE events
        SET month = ${month}, day = ${day}, title = ${title},
            description = ${description}, status = ${status},
            event_date = ${event_date}, event_time = ${event_time},
            event_type = ${event_type}, link = ${link},
            remind_before_min = ${remind_before_min}, updated_at = NOW()
        WHERE id = ${id}
      `;

      const updatedEventResult = await sql`SELECT * FROM events WHERE id = ${id}`;
      const updatedEvent = updatedEventResult[0];

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

      return NextResponse.json({ success: true });
    }

    // Crear nuevo
    const result = await sql`
      INSERT INTO events (month, day, title, description, status, event_date, event_time, event_type, link, remind_before_min)
      VALUES (${month}, ${day}, ${title}, ${description}, ${status}, ${event_date}, ${event_time}, ${event_type}, ${link}, ${remind_before_min})
      RETURNING *
    `;
    const newEvent = result[0];

    await logAudit({
      action: "CREATE",
      tableName: "events",
      recordId: newEvent.id,
      session,
      request,
      newValues: newEvent,
      permissionUsed: permissions?.is_admin ? "is_admin" : "can_publish_events",
    });

    // Push a todos los dispositivos suscritos (no bloquea la respuesta si falla)
    try {
      const typeLabel = TYPE_LABELS[event_type] || "Evento";
      const when = event_date
        ? ` · ${deriveMonthDay(event_date).day} ${deriveMonthDay(event_date).month}${event_time ? " " + event_time : ""}`
        : "";
      await sendPushToAll({
        title: `${typeLabel}: ${title}`,
        body: (description ? description.slice(0, 120) : "Nuevo evento del clan") + when,
        url: "/#events",
        tag: `event-${newEvent.id}`,
      });
    } catch (e) {
      console.error("Push de evento falló:", e.message);
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

    const deletedEventResult = await sql`SELECT * FROM events WHERE id = ${id}`;
    const deletedEvent = deletedEventResult[0];

    await sql`DELETE FROM events WHERE id = ${id}`;

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
