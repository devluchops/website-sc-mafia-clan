import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.permissions?.is_admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: "Username requerido" }, { status: 400 });
    }

    const sql = getDb();

    console.log(`Eliminando usuario: ${username}`);

    // 1. Eliminar de user_permissions
    const permsDeleted = await sql`
      DELETE FROM user_permissions
      WHERE discord_username = ${username}
      RETURNING *
    `;
    console.log(`Eliminados ${permsDeleted.length} registros de user_permissions`);

    // 2. Eliminar de discord_authorized_users
    const usersDeleted = await sql`
      DELETE FROM discord_authorized_users
      WHERE discord_username = ${username}
      RETURNING *
    `;
    console.log(`Eliminados ${usersDeleted.length} registros de discord_authorized_users`);

    return NextResponse.json({
      success: true,
      message: `Usuario ${username} eliminado completamente`,
      deleted: {
        permissions: permsDeleted.length,
        authorized_users: usersDeleted.length,
      }
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
