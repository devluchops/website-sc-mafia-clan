import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST() {
  try {
    const sql = getDb();

    // Encontrar todos los duplicados (mismo discord_id aparece más de una vez)
    const duplicates = await sql`
      SELECT discord_id, COUNT(*) as count
      FROM user_permissions
      WHERE discord_id IS NOT NULL
      GROUP BY discord_id
      HAVING COUNT(*) > 1
    `;

    const results = [];

    for (const dup of duplicates) {
      const discordId = dup.discord_id;

      // Obtener todos los registros de este discord_id
      const records = await sql`
        SELECT * FROM user_permissions
        WHERE discord_id = ${discordId}
        ORDER BY created_at ASC
      `;

      // Mantener el PRIMERO (más antiguo), eliminar los demás
      const toKeep = records[0];
      const toDelete = records.slice(1);

      for (const record of toDelete) {
        await sql`DELETE FROM user_permissions WHERE id = ${record.id}`;
      }

      results.push({
        discord_id: discordId,
        kept: toKeep.id,
        deleted: toDelete.map(r => r.id)
      });
    }

    return NextResponse.json({
      success: true,
      cleaned: results,
      message: `Limpiados ${duplicates.length} duplicados`
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
