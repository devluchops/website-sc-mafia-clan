import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

async function ensureTable(sql) {
  await sql`CREATE TABLE IF NOT EXISTS clan_org (
    id SERIAL PRIMARY KEY,
    section VARCHAR(20) NOT NULL,
    name VARCHAR(120) NOT NULL,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

const VALID = ["lider", "socio", "cm", "capitan", "miembro"];

export async function GET() {
  try {
    const sql = getDb();
    await ensureTable(sql);
    const org = await sql`SELECT id, section, name, order_index FROM clan_org ORDER BY order_index ASC`;
    return NextResponse.json({ org });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Reemplaza todo el organigrama con las entradas enviadas
export async function POST(request) {
  const session = await getServerSession(authOptions);
  const perms = session?.user?.permissions;
  if (!perms?.is_admin && !perms?.can_manage_members) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  try {
    const { entries } = await request.json();
    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: "entries debe ser un arreglo" }, { status: 400 });
    }
    const clean = entries
      .filter((e) => e && e.name && String(e.name).trim() && VALID.includes(e.section))
      .map((e) => ({ section: e.section, name: String(e.name).trim() }));

    const sql = getDb();
    await ensureTable(sql);
    await sql`DELETE FROM clan_org`;
    let i = 0;
    for (const e of clean) {
      i++;
      await sql`INSERT INTO clan_org (section, name, order_index) VALUES (${e.section}, ${e.name}, ${i})`;
    }
    return NextResponse.json({ ok: true, count: clean.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
