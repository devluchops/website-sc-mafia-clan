import { getDb } from "@/lib/db";

/**
 * Log de operaciones CRUD en admin panel
 *
 * @param {Object} params
 * @param {string} params.action - CREATE, UPDATE, DELETE
 * @param {string} params.tableName - Nombre de la tabla afectada
 * @param {number} params.recordId - ID del registro
 * @param {Object} params.session - NextAuth session
 * @param {Request} params.request - Request object
 * @param {Object} params.oldValues - Valores anteriores (UPDATE/DELETE)
 * @param {Object} params.newValues - Valores nuevos (CREATE/UPDATE)
 * @param {string} params.permissionUsed - Permiso usado para la acción
 */
export async function logAudit({
  action,
  tableName,
  recordId,
  session,
  request,
  oldValues = null,
  newValues = null,
  permissionUsed = null,
}) {
  // Non-blocking logging - nunca debe causar errores en la operación principal
  try {
    const sql = getDb();

    // Extraer información del actor
    const actorDiscordId = session?.user?.discordId || null;
    const actorUsername = session?.user?.discordUsername || session?.user?.name || null;
    const actorEmail = session?.user?.email || null;
    const isAdmin = session?.user?.permissions?.is_admin || false;

    // Buscar member_id si existe
    let actorMemberId = null;
    if (actorDiscordId) {
      const [member] = await sql`
        SELECT id FROM members WHERE discord_id = ${actorDiscordId}
      `;
      actorMemberId = member?.id || null;
    }

    // Calcular diferencias solo para UPDATE
    let changes = null;
    if (action === "UPDATE" && oldValues && newValues) {
      changes = {};
      for (const key in newValues) {
        if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
          changes[key] = {
            from: oldValues[key],
            to: newValues[key],
          };
        }
      }
    }

    // Extraer IP y User-Agent
    const ipAddress = extractIpAddress(request);
    const userAgent = request?.headers?.get("user-agent") || null;

    // Insertar log
    await sql`
      INSERT INTO audit_logs (
        action,
        table_name,
        record_id,
        actor_discord_id,
        actor_discord_username,
        actor_email,
        actor_member_id,
        permission_used,
        is_admin,
        old_values,
        new_values,
        changes,
        ip_address,
        user_agent
      ) VALUES (
        ${action},
        ${tableName},
        ${recordId},
        ${actorDiscordId},
        ${actorUsername},
        ${actorEmail},
        ${actorMemberId},
        ${permissionUsed},
        ${isAdmin},
        ${oldValues ? JSON.stringify(oldValues) : null},
        ${newValues ? JSON.stringify(newValues) : null},
        ${changes ? JSON.stringify(changes) : null},
        ${ipAddress},
        ${userAgent}
      )
    `;
  } catch (error) {
    // Log el error pero NO propagarlo (fail-safe)
    console.error("[Audit Log] Error logging action:", error);
  }
}

/**
 * Log de eventos de sesión (login/logout)
 *
 * @param {Object} params
 * @param {string} params.action - LOGIN, LOGOUT, LOGIN_FAILED
 * @param {Object} params.user - User object (profile de Discord)
 * @param {Request} params.request - Request object (si está disponible)
 */
export async function logSession({
  action,
  user,
  request = null,
}) {
  try {
    const sql = getDb();

    const discordId = user?.id || null;
    const username = user?.username || user?.name || null;
    const email = user?.email || null;

    // Buscar member_id si existe
    let memberId = null;
    if (discordId) {
      const [member] = await sql`
        SELECT id FROM members WHERE discord_id = ${discordId}
      `;
      memberId = member?.id || null;
    }

    // Extraer IP y User-Agent
    const ipAddress = request ? extractIpAddress(request) : null;
    const userAgent = request?.headers?.get("user-agent") || null;

    await sql`
      INSERT INTO audit_logs (
        action,
        table_name,
        record_id,
        actor_discord_id,
        actor_discord_username,
        actor_email,
        actor_member_id,
        permission_used,
        is_admin,
        old_values,
        new_values,
        changes,
        ip_address,
        user_agent
      ) VALUES (
        ${action},
        NULL,
        NULL,
        ${discordId},
        ${username},
        ${email},
        ${memberId},
        NULL,
        false,
        NULL,
        NULL,
        NULL,
        ${ipAddress},
        ${userAgent}
      )
    `;
  } catch (error) {
    console.error("[Audit Log] Error logging session:", error);
  }
}

/**
 * Extraer IP address del request
 * Considera proxies y headers de Vercel
 */
function extractIpAddress(request) {
  if (!request || !request.headers) return null;

  // Headers comunes de proxy (Vercel, Cloudflare, nginx)
  const ipHeaders = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "true-client-ip",
  ];

  for (const header of ipHeaders) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for puede tener múltiples IPs separadas por coma
      return value.split(",")[0].trim();
    }
  }

  return null;
}
