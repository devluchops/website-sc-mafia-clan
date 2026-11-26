import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendPushToAll } from "@/lib/push";

// Perú = America/Lima = UTC-5 (sin horario de verano)
const LIMA_OFFSET_HOURS = 5;
const WINDOW_MS = 30 * 60 * 1000; // margen para no perder el disparo entre corridas

const TYPE_LABELS = {
  showmatch: "Showmatch",
  partida: "Partida",
  torneo: "Torneo",
  reunion: "Reunión",
  anuncio: "Anuncio",
  evento: "Evento",
};

function parseStart(timeStr) {
  if (!timeStr) return { h: 9, m: 0 };
  const first = String(timeStr).split(/[-–—]/)[0].trim();
  const m = first.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!m) return { h: 9, m: 0 };
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = (m[3] || "").toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return { h, m: min };
}

function startInstantUTC(eventDate, timeStr) {
  // neon devuelve DATE como objeto Date; usamos sus componentes UTC
  const d = new Date(eventDate);
  if (isNaN(d.getTime())) return null;
  const { h, m } = parseStart(timeStr);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h + LIMA_OFFSET_HOURS, m);
}

/**
 * Recordatorios de eventos. Pensado para ejecutarse cada ~15 min desde un
 * programador externo (GitHub Actions), porque el plan Hobby de Vercel solo
 * permite cron diario. Dispara cuando llega el momento del recordatorio
 * (inicio - "avisar antes") y marca el evento para no repetir.
 */
export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const sql = getDb();
    await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS reminded_at TIMESTAMP`;
    await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS remind_before_min INTEGER DEFAULT 0`;

    const now = Date.now();
    const events = await sql`
      SELECT * FROM events
      WHERE event_date IS NOT NULL AND reminded_at IS NULL
    `;

    const sent = [];
    for (const ev of events) {
      const start = startInstantUTC(ev.event_date, ev.event_time);
      if (start == null) continue;
      const lead = (ev.remind_before_min || 0) * 60 * 1000;
      const remindAt = start - lead;
      if (now >= remindAt && now - remindAt <= WINDOW_MS) {
        const label = TYPE_LABELS[ev.event_type] || "Evento";
        const leadTxt =
          !ev.remind_before_min || ev.remind_before_min <= 0
            ? "¡Empieza ahora!"
            : ev.remind_before_min >= 1440
            ? "Es mañana"
            : ev.remind_before_min >= 60
            ? `Empieza en ${Math.round(ev.remind_before_min / 60)}h`
            : `Empieza en ${ev.remind_before_min} min`;
        try {
          await sendPushToAll({
            title: `${label}: ${ev.title}`,
            body: `${leadTxt}${ev.event_time ? " · " + ev.event_time : ""}`,
            url: "/#events",
            tag: `event-reminder-${ev.id}`,
            topic: ev.event_type,
          });
          await sql`UPDATE events SET reminded_at = NOW() WHERE id = ${ev.id}`;
          sent.push({ id: ev.id, title: ev.title });
        } catch (e) {
          console.error("Recordatorio falló para evento", ev.id, e.message);
        }
      }
    }

    return NextResponse.json({ ok: true, checked: events.length, sent });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
