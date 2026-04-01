import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Solo admins pueden ver audit logs
    if (!session?.user?.permissions?.is_admin) {
      return Response.json({ error: "No autorizado" }, { status: 403 });
    }

    const sql = getDb();
    const { searchParams } = new URL(request.url);

    // Parámetros de filtrado
    const action = searchParams.get("action");
    const tableName = searchParams.get("table_name");
    const actor = searchParams.get("actor");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Construir query dinámicamente con filtros
    let logs, countResult;

    if (!action && !tableName && !actor && !startDate && !endDate) {
      // Sin filtros - query simple
      logs = await sql`
        SELECT *
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      countResult = await sql`
        SELECT COUNT(*) as count
        FROM audit_logs
      `;
    } else {
      // Con filtros - construir WHERE dinámicamente
      const conditions = [];

      if (action) conditions.push(sql`action = ${action}`);
      if (tableName) conditions.push(sql`table_name = ${tableName}`);
      if (actor) {
        const pattern = `%${actor}%`;
        conditions.push(sql`(actor_discord_username ILIKE ${pattern} OR actor_email ILIKE ${pattern})`);
      }
      if (startDate) conditions.push(sql`created_at >= ${startDate}::date`);
      if (endDate) conditions.push(sql`created_at <= (${endDate}::date + interval '1 day')`);

      // Combinar condiciones con AND
      let whereClause = conditions[0];
      for (let i = 1; i < conditions.length; i++) {
        whereClause = sql`${whereClause} AND ${conditions[i]}`;
      }

      // Query principal con filtros
      logs = await sql`
        SELECT *
        FROM audit_logs
        WHERE ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      // Contar total con filtros
      countResult = await sql`
        SELECT COUNT(*) as count
        FROM audit_logs
        WHERE ${whereClause}
      `;
    }

    const totalLogs = parseInt(countResult[0].count);
    const totalPages = Math.ceil(totalLogs / limit);

    return Response.json({
      logs,
      totalPages,
      currentPage: page,
      totalLogs,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
