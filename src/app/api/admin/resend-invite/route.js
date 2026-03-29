import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendInviteEmail } from "@/lib/email";

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const permissions = session.user?.permissions;
  if (!permissions?.is_admin && !permissions?.can_manage_members) {
    return NextResponse.json(
      { error: "No tienes permisos para reenviar invitaciones" },
      { status: 403 }
    );
  }

  try {
    const { memberId } = await request.json();
    const sql = getDb();

    // Obtener datos del miembro
    const [member] = await sql`
      SELECT * FROM members WHERE id = ${memberId}
    `;

    if (!member) {
      return NextResponse.json(
        { error: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    if (!member.email) {
      return NextResponse.json(
        { error: "El miembro no tiene email configurado" },
        { status: 400 }
      );
    }

    if (!member.social_discord) {
      return NextResponse.json(
        { error: "El miembro no tiene Discord configurado" },
        { status: 400 }
      );
    }

    // Enviar email de invitación
    console.log(`Reenviando invite a ${member.email}...`);
    const result = await sendInviteEmail(member);

    if (result) {
      // Actualizar invite_sent_at
      await sql`
        UPDATE members
        SET invite_sent_at = NOW()
        WHERE id = ${memberId}
      `;

      return NextResponse.json({
        success: true,
        message: `Invitación reenviada exitosamente a ${member.email}`,
        emailId: result.id,
      });
    } else {
      return NextResponse.json(
        { error: "No se pudo enviar el email (Resend no configurado)" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error reenviando invitación:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
