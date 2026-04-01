import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/audit";

// GET: Obtener todos los build orders
export async function GET() {
  try {
    const sql = getDb();
    const buildOrders = await sql`
      SELECT * FROM build_orders
      ORDER BY race, name
    `;
    return NextResponse.json(buildOrders);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Crear o actualizar build order
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_manage_build_orders) {
    return NextResponse.json(
      { error: "No tienes permisos para gestionar build orders" },
      { status: 403 }
    );
  }

  try {
    const {
      id,
      name,
      race,
      matchups,
      description,
      build_steps,
      video_url,
      difficulty,
      tags,
    } = await request.json();
    const sql = getDb();

    if (id) {
      // Obtener valores antiguos antes de actualizar
      const oldBuildOrderResult = await sql`SELECT * FROM build_orders WHERE id = ${id}`;
      const oldBuildOrder = oldBuildOrderResult[0];

      // Actualizar
      await sql`
        UPDATE build_orders
        SET name = ${name},
            race = ${race},
            matchups = ${matchups},
            description = ${description},
            build_steps = ${JSON.stringify(build_steps)},
            video_url = ${video_url || null},
            difficulty = ${difficulty || "Intermedio"},
            tags = ${tags || []},
            updated_at = NOW()
        WHERE id = ${id}
      `;

      // Obtener valores nuevos después de actualizar
      const updatedBuildOrderResult = await sql`SELECT * FROM build_orders WHERE id = ${id}`;
      const updatedBuildOrder = updatedBuildOrderResult[0];

      // Log audit
      await logAudit({
        action: "UPDATE",
        tableName: "build_orders",
        recordId: id,
        session,
        request,
        oldValues: oldBuildOrder,
        newValues: updatedBuildOrder,
        permissionUsed: permissions?.is_admin ? "is_admin" : "can_manage_build_orders",
      });
    } else {
      // Crear nuevo
      const result = await sql`
        INSERT INTO build_orders (
          name, race, matchups, description, build_steps,
          video_url, difficulty, tags
        )
        VALUES (
          ${name}, ${race}, ${matchups}, ${description},
          ${JSON.stringify(build_steps)}, ${video_url || null},
          ${difficulty || "Intermedio"}, ${tags || []}
        )
        RETURNING *
      `;
      const newBuildOrder = result[0];

      // Log audit
      await logAudit({
        action: "CREATE",
        tableName: "build_orders",
        recordId: newBuildOrder.id,
        session,
        request,
        newValues: newBuildOrder,
        permissionUsed: permissions?.is_admin ? "is_admin" : "can_manage_build_orders",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar build order
export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_manage_build_orders) {
    return NextResponse.json(
      { error: "No tienes permisos para eliminar build orders" },
      { status: 403 }
    );
  }

  try {
    const { id } = await request.json();
    const sql = getDb();

    // Obtener build order antes de eliminarlo
    const deletedBuildOrderResult = await sql`SELECT * FROM build_orders WHERE id = ${id}`;
    const deletedBuildOrder = deletedBuildOrderResult[0];

    await sql`DELETE FROM build_orders WHERE id = ${id}`;

    // Log audit
    await logAudit({
      action: "DELETE",
      tableName: "build_orders",
      recordId: id,
      session,
      request,
      oldValues: deletedBuildOrder,
      permissionUsed: permissions?.is_admin ? "is_admin" : "can_manage_build_orders",
    });

    return NextResponse.json({
      success: true,
      message: "Build order eliminado correctamente",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
