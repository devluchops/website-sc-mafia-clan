import { NextResponse } from "next/server";
import { getPushLog } from "@/lib/push";

// Bandeja pública: los últimos avisos del clan (solo lo que la gente debe ver).
// Sin datos de admin (quién envió, resultados por dispositivo).
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await getPushLog(30);
    const items = rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      detail: r.detail || null,
      url: r.url || null,
      created_at: r.created_at,
    }));
    return NextResponse.json({ items });
  } catch (_e) {
    return NextResponse.json({ items: [] });
  }
}
