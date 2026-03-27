import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.permissions?.is_admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const sql = getDb();

    console.log('🔧 Agregando columna discord_username a user_permissions...');

    // Agregar columna si no existe
    await sql`
      ALTER TABLE user_permissions
      ADD COLUMN IF NOT EXISTS discord_username VARCHAR(255)
    `;

    console.log('✅ Columna discord_username agregada');

    // Poblar la columna con datos de discord_authorized_users
    const updated = await sql`
      UPDATE user_permissions up
      SET discord_username = dau.discord_username
      FROM discord_authorized_users dau
      WHERE up.discord_id = dau.discord_id
      AND up.discord_username IS NULL
      RETURNING up.*
    `;

    console.log(`✅ ${updated.length} registros actualizados`);

    return NextResponse.json({
      success: true,
      message: 'Migración completada',
      updated: updated.length
    });
  } catch (error) {
    console.error('❌ Error en migración:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
