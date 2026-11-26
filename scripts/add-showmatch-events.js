/**
 * Inserta los showmatches/eventos del calendario en la tabla `events`.
 * Idempotente: no duplica si ya existe un evento con el mismo título y fecha.
 *
 * Uso: node scripts/add-showmatch-events.js
 * (Lee DATABASE_URL desde .env.local)
 */
const fs = require("fs");
const path = require("path");
const { neon } = require("@neondatabase/serverless");

// Cargar DATABASE_URL desde .env.local sin dependencias extra
function loadEnv() {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  }
}
loadEnv();

const MONTHS_ABBR = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const TIME = "8:00 AM - 12:00 AM";

const EVENTS = [
  { date: "2026-11-28", title: "Showmatch: Evil con Tremoz", type: "showmatch", description: "Showmatch del streamer Evil junto a Tremoz." },
  { date: "2026-11-30", title: "Ank vs MAFIA",               type: "partida",   description: "Enfrentamiento Ank contra el clan MAFIA." },
  { date: "2026-12-02", title: "Showmatch: Evil vs Thanatoz", type: "showmatch", description: "Showmatch Evil vs Thanatoz." },
  { date: "2026-12-03", title: "Clan War con Lgx",           type: "torneo",    description: "Clan War de MAFIA contra Lgx." },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("Falta DATABASE_URL (.env.local)");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  // Asegurar columnas del calendario
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_date DATE`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_time VARCHAR(20)`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type VARCHAR(40) DEFAULT 'evento'`;
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS link TEXT`;

  let added = 0, skipped = 0;
  for (const e of EVENTS) {
    const d = new Date(e.date + "T00:00:00");
    const month = MONTHS_ABBR[d.getMonth()];
    const day = String(d.getDate());

    const existing = await sql`SELECT id FROM events WHERE title = ${e.title} AND event_date = ${e.date}`;
    if (existing.length > 0) { skipped++; console.log(`= ya existe: ${e.title}`); continue; }

    await sql`
      INSERT INTO events (month, day, title, description, status, event_date, event_time, event_type)
      VALUES (${month}, ${day}, ${e.title}, ${e.description}, 'Abierto', ${e.date}, ${TIME}, ${e.type})
    `;
    added++;
    console.log(`+ ${e.date}  [${e.type}]  ${e.title}`);
  }
  console.log(`\nListo. Agregados: ${added}, ya existían: ${skipped}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
