import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const LIMA_OFFSET_HOURS = 5; // America/Lima = UTC-5

function parseTime(token, fallbackH) {
  if (!token) return { h: fallbackH, m: 0 };
  const m = String(token).trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!m) return { h: fallbackH, m: 0 };
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = (m[3] || "").toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return { h, m: min };
}

function fmtUTC(ms) {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function esc(s) {
  return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(_req, { params }) {
  try {
    const sql = getDb();
    const [ev] = await sql`SELECT * FROM events WHERE id = ${params.id}`;
    if (!ev || !ev.event_date) {
      return new Response("Evento sin fecha", { status: 404 });
    }

    const ymd = String(ev.event_date).slice(0, 10).split("-").map(Number);
    const parts = String(ev.event_time || "").split(/[-–—]/);
    const start = parseTime(parts[0], 20);
    const end = parts[1] ? parseTime(parts[1], 23) : { h: start.h + 2, m: start.m };

    // Lima local -> UTC
    let startMs = Date.UTC(ymd[0], ymd[1] - 1, ymd[2], start.h + LIMA_OFFSET_HOURS, start.m);
    let endMs = Date.UTC(ymd[0], ymd[1] - 1, ymd[2], end.h + LIMA_OFFSET_HOURS, end.m);
    if (endMs <= startMs) endMs += 24 * 3600 * 1000; // termina al día siguiente (ej. medianoche)

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Clan MAFIA//Eventos//ES",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:event-${ev.id}@clanmafia.devluchops.space`,
      `DTSTAMP:${fmtUTC(Date.now())}`,
      `DTSTART:${fmtUTC(startMs)}`,
      `DTEND:${fmtUTC(endMs)}`,
      `SUMMARY:${esc(ev.title)}`,
      `DESCRIPTION:${esc(ev.description)}`,
      ev.link ? `URL:${esc(ev.link)}` : "",
      "END:VEVENT",
      "END:VCALENDAR",
    ].filter(Boolean).join("\r\n");

    return new Response(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="evento-${ev.id}.ics"`,
      },
    });
  } catch (error) {
    return new Response("Error: " + error.message, { status: 500 });
  }
}
