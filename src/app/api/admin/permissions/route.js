import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

// Helper to check if user can manage permissions
async function canManagePermissions(session) {
  if (!session?.user?.discordId) {
    return false;
  }

  const permissions = session.user.permissions;
  return permissions?.is_admin || permissions?.can_manage_permissions;
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(await canManagePermissions(session))) {
      return Response.json({ error: "No autorizado" }, { status: 403 });
    }

    const sql = getDb();

    // Get all users with Discord linked (both members and non-members)
    const result = await sql`
      SELECT
        dau.discord_id,
        dau.discord_username,
        dau.email,
        m.id as member_id,
        m.name as member_name,
        m.rank as member_rank,
        COALESCE(up.is_admin, false) as is_admin,
        COALESCE(up.can_publish_blog, false) as can_publish_blog,
        COALESCE(up.can_publish_videos, false) as can_publish_videos,
        COALESCE(up.can_publish_events, false) as can_publish_events,
        COALESCE(up.can_edit_rules, false) as can_edit_rules,
        COALESCE(up.can_manage_members, false) as can_manage_members,
        COALESCE(up.can_manage_permissions, false) as can_manage_permissions
      FROM discord_authorized_users dau
      LEFT JOIN user_permissions up ON (
        dau.discord_id = up.discord_id OR
        dau.discord_username = up.discord_username
      )
      LEFT JOIN members m ON (
        dau.discord_id = m.discord_id OR
        dau.discord_username = m.social_discord
      )
      ORDER BY dau.discord_username
    `;

    return Response.json({ members: result });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(await canManagePermissions(session))) {
      return Response.json({ error: "No autorizado" }, { status: 403 });
    }

    const {
      discord_id,
      discord_username,
      is_admin,
      can_publish_blog,
      can_publish_videos,
      can_publish_events,
      can_edit_rules,
      can_manage_members,
      can_manage_permissions,
    } = await request.json();

    if (!discord_id && !discord_username) {
      return Response.json({ error: "Discord ID o Username requerido" }, { status: 400 });
    }

    const sql = getDb();

    // Get discord_username from discord_authorized_users if not provided
    let username = discord_username;
    if (!username && discord_id) {
      const userResult = await sql`
        SELECT discord_username FROM discord_authorized_users WHERE discord_id = ${discord_id}
      `;
      username = userResult.length > 0 ? userResult[0].discord_username : null;
    }

    // Get member_id (optional - user might not be in roster)
    const members = await sql`
      SELECT id FROM members
      WHERE discord_id = ${discord_id} OR social_discord = ${username}
    `;

    const memberId = members.length > 0 ? members[0].id : null;

    // Check if permissions record exists (by discord_id or username)
    const existing = await sql`
      SELECT * FROM user_permissions
      WHERE discord_id = ${discord_id} OR discord_username = ${username}
    `;

    if (existing.length > 0) {
      // Update existing permissions
      await sql`
        UPDATE user_permissions
        SET
          discord_id = ${discord_id},
          discord_username = ${username},
          member_id = ${memberId},
          is_admin = ${is_admin || false},
          can_publish_blog = ${can_publish_blog || false},
          can_publish_videos = ${can_publish_videos || false},
          can_publish_events = ${can_publish_events || false},
          can_edit_rules = ${can_edit_rules || false},
          can_manage_members = ${can_manage_members || false},
          can_manage_permissions = ${can_manage_permissions || false},
          updated_at = NOW()
        WHERE discord_id = ${discord_id} OR discord_username = ${username}
      `;
    } else {
      // Create new permissions record
      await sql`
        INSERT INTO user_permissions (
          discord_id,
          discord_username,
          member_id,
          is_admin,
          can_publish_blog,
          can_publish_videos,
          can_publish_events,
          can_edit_rules,
          can_manage_members,
          can_manage_permissions
        ) VALUES (
          ${discord_id},
          ${username},
          ${memberId},
          ${is_admin || false},
          ${can_publish_blog || false},
          ${can_publish_videos || false},
          ${can_publish_events || false},
          ${can_edit_rules || false},
          ${can_manage_members || false},
          ${can_manage_permissions || false}
        )
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating permissions:", error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
