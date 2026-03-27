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

    console.log('🔧 Quitando restricción NOT NULL de discord_id...');

    // Quitar restricción NOT NULL de discord_id en user_permissions
    await sql`
      ALTER TABLE user_permissions
      ALTER COLUMN discord_id DROP NOT NULL
    `;

    console.log('✅ Restricción NOT NULL removida de discord_id');

    // Hacer lo mismo en discord_authorized_users por si acaso
    await sql`
      ALTER TABLE discord_authorized_users
      ALTER COLUMN discord_id DROP NOT NULL
    `;

    console.log('✅ Restricción NOT NULL removida en ambas tablas');

    return NextResponse.json({
      success: true,
      message: 'Restricciones NOT NULL removidas correctamente'
    });
  } catch (error) {
    console.error('❌ Error en migración:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
