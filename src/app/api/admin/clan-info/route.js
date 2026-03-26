import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

// GET: Obtener información del clan
export async function GET() {
  try {
    const sql = getDb();
    const [clanInfo] = await sql`SELECT * FROM clan_info LIMIT 1`;
    return NextResponse.json(clanInfo);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Actualizar información del clan
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { name, tagline } = await request.json();
    const sql = getDb();

    await sql`
      UPDATE clan_info
      SET name = ${name}, tagline = ${tagline}, updated_at = NOW()
      WHERE id = 1
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
