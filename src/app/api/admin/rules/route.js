import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { logAudit } from "@/lib/audit";

// GET: Obtener todas las reglas
export async function GET() {
  try {
    const sql = getDb();
    const rules = await sql`SELECT * FROM clan_rules ORDER BY order_index ASC`;
    return NextResponse.json(rules);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Agregar/actualizar regla
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_edit_rules) {
    return NextResponse.json({ error: "No tienes permisos para editar reglas" }, { status: 403 });
  }

  try {
    const { id, category, title, description, order_index } = await request.json();
    const sql = getDb();

    if (id) {
      // Obtener valores antiguos antes de actualizar
      const oldRuleResult = await sql`SELECT * FROM clan_rules WHERE id = ${id}`;
      const oldRule = oldRuleResult[0];

      // Actualizar
      await sql`
        UPDATE clan_rules
        SET category = ${category}, title = ${title}, description = ${description},
            order_index = ${order_index}, updated_at = NOW()
        WHERE id = ${id}
      `;

      // Obtener valores nuevos después de actualizar
      const updatedRuleResult = await sql`SELECT * FROM clan_rules WHERE id = ${id}`;
      const updatedRule = updatedRuleResult[0];

      // Log audit
      await logAudit({
        action: "UPDATE",
        tableName: "clan_rules",
        recordId: id,
        session,
        request,
        oldValues: oldRule,
        newValues: updatedRule,
        permissionUsed: permissions?.is_admin ? "is_admin" : "can_edit_rules",
      });
    } else {
      // Crear nueva
      const result = await sql`
        INSERT INTO clan_rules (category, title, description, order_index)
        VALUES (${category}, ${title}, ${description}, ${order_index || 0})
        RETURNING *
      `;
      const newRule = result[0];

      // Log audit
      await logAudit({
        action: "CREATE",
        tableName: "clan_rules",
        recordId: newRule.id,
        session,
        request,
        newValues: newRule,
        permissionUsed: permissions?.is_admin ? "is_admin" : "can_edit_rules",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar regla
export async function DELETE(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_edit_rules) {
    return NextResponse.json({ error: "No tienes permisos para eliminar reglas" }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    const sql = getDb();

    // Obtener regla antes de eliminarla
    const deletedRuleResult = await sql`SELECT * FROM clan_rules WHERE id = ${id}`;
    const deletedRule = deletedRuleResult[0];

    await sql`DELETE FROM clan_rules WHERE id = ${id}`;

    // Log audit
    await logAudit({
      action: "DELETE",
      tableName: "clan_rules",
      recordId: id,
      session,
      request,
      oldValues: deletedRule,
      permissionUsed: permissions?.is_admin ? "is_admin" : "can_edit_rules",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
