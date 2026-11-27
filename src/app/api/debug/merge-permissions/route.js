import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST() {
  try {
    const sql = getDb();

    // Fusionar registros duplicados
    // Estrategia: Eliminar registros con solo member_id, mantener los que tienen discord_id

    // 1. and36: member_id 16, discord_id 1158300711604473857
    await sql`DELETE FROM user_permissions WHERE id = 11`; // Eliminar el viejo sin discord_id
    await sql`UPDATE user_permissions SET member_id = 16 WHERE id = 12`; // Agregar member_id al nuevo

    // 2. Eliminar otros registros sin discord_id (ID 9, 10)
    // Estos parecen ser de prueba o huérfanos
    await sql`DELETE FROM user_permissions WHERE id IN (9, 10)`;

    return NextResponse.json({
      success: true,
      message: "Permisos fusionados correctamente"
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
