import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/audit";

async function ensureTable(sql) {
  await sql`CREATE TABLE IF NOT EXISTS clan_finance (
    id SERIAL PRIMARY KEY,
    kind VARCHAR(10) NOT NULL,
    category VARCHAR(60),
    concept VARCHAR(200),
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    tx_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;
}

// GET: movimientos de un año (?year=YYYY, por defecto el actual)
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.permissions?.is_admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  try {
    const sql = getDb();
    await ensureTable(sql);
    const year = parseInt(new URL(request.url).searchParams.get("year"), 10) || new Date().getFullYear();
    const rows = await sql`
      SELECT id, kind, category, concept, amount::float AS amount, tx_date
      FROM clan_finance
      WHERE EXTRACT(YEAR FROM tx_date) = ${year}
      ORDER BY tx_date DESC, id DESC
    `;
    const years = await sql`SELECT DISTINCT EXTRACT(YEAR FROM tx_date)::int AS y FROM clan_finance ORDER BY y DESC`;
    return NextResponse.json({ year, rows, years: years.map((r) => r.y) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: crear o actualizar (si trae id) un movimiento
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.permissions?.is_admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  try {
    const { id, kind, category, concept, amount, tx_date } = await request.json();
    if (!["ingreso", "egreso"].includes(kind)) {
      return NextResponse.json({ error: "kind inválido" }, { status: 400 });
    }
    const amt = Number(amount);
    if (!tx_date || isNaN(amt)) {
      return NextResponse.json({ error: "Monto y fecha requeridos" }, { status: 400 });
    }
    const sql = getDb();
    await ensureTable(sql);
    if (id) {
      await sql`UPDATE clan_finance SET kind=${kind}, category=${category || null}, concept=${concept || null}, amount=${amt}, tx_date=${tx_date}, updated_at=NOW() WHERE id=${id}`;
    } else {
      await sql`INSERT INTO clan_finance (kind, category, concept, amount, tx_date) VALUES (${kind}, ${category || null}, ${concept || null}, ${amt}, ${tx_date})`;
    }
    try { await logAudit({ action: id ? "UPDATE" : "CREATE", tableName: "clan_finance", recordId: id || null, session, request, newValues: { kind, category, concept, amount: amt, tx_date } }); } catch (_e) {}
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: eliminar un movimiento
export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.permissions?.is_admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  try {
    const { id } = await request.json();
    const sql = getDb();
    await ensureTable(sql);
    await sql`DELETE FROM clan_finance WHERE id=${id}`;
    try { await logAudit({ action: "DELETE", tableName: "clan_finance", recordId: id, session, request }); } catch (_e) {}
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
