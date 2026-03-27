import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendInviteEmail } from "@/lib/email";

/**
 * POST: Envía un email de invitación a un miembro
 */
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_manage_members) {
    return NextResponse.json({ error: "No tienes permisos para enviar invites" }, { status: 403 });
  }

  try {
    const { memberId } = await request.json();
    const sql = getDb();

    // Obtener el miembro
    const members = await sql`SELECT * FROM members WHERE id = ${memberId}`;

    if (members.length === 0) {
      return NextResponse.json({ error: "Miembro no encontrado" }, { status: 404 });
    }

    const member = members[0];

    // Validar que tenga email y discord
    if (!member.email) {
      return NextResponse.json({ error: "El miembro no tiene email configurado" }, { status: 400 });
    }

    if (!member.social_discord) {
      return NextResponse.json({ error: "El miembro no tiene Discord configurado" }, { status: 400 });
    }

    // Enviar el email
    await sendInviteEmail(member);

    // Actualizar la fecha de envío del invite
    await sql`
      UPDATE members
      SET invite_sent_at = NOW()
      WHERE id = ${memberId}
    `;

    return NextResponse.json({
      success: true,
      message: `Invite enviado a ${member.email}`
    });

  } catch (error) {
    console.error('Error enviando invite:', error);
    return NextResponse.json({
      error: error.message || "Error al enviar invite"
    }, { status: 500 });
  }
}
