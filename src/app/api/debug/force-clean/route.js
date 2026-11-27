import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST() {
  try {
    const sql = getDb();

    // Eliminar duplicado de and36 (ID 11)
    const result1 = await sql`
      DELETE FROM user_permissions
      WHERE id = ${11}
    `;

    // Actualizar el registro válido con member_id
    const result2 = await sql`
      UPDATE user_permissions
      SET member_id = ${16}
      WHERE id = ${12}
    `;

    // Eliminar registros huérfanos sin discord_id
    const result3 = await sql`
      DELETE FROM user_permissions
      WHERE id = ${9}
    `;

    const result4 = await sql`
      DELETE FROM user_permissions
      WHERE id = ${10}
    `;

    return NextResponse.json({
      success: true,
      deleted: [result1, result3, result4],
      updated: result2
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
