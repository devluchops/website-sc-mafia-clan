import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendInviteEmail } from "@/lib/email";

/**
 * Endpoint temporal para enviar invite a Roma
 * Usar solo una vez para resolver el problema de chicken-and-egg
 */
export async function GET() {
  try {
    const sql = getDb();

    // Buscar Roma
    const [roma] = await sql`
      SELECT * FROM members
      WHERE id = 34
        AND email IS NOT NULL
        AND last_login_at IS NULL
    `;

    if (!roma) {
      return NextResponse.json(
        { error: "Roma no encontrado o ya hizo login" },
        { status: 404 }
      );
    }

    // Enviar invite email
    console.log("Enviando invite a Roma:", roma.email);
    const result = await sendInviteEmail(roma);

    if (result) {
      // Actualizar invite_sent_at
      await sql`
        UPDATE members
        SET invite_sent_at = NOW()
        WHERE id = 34
      `;

      return NextResponse.json({
        success: true,
        message: "Invite enviado exitosamente a " + roma.email,
        emailId: result.id,
        sentTo: roma.email,
      });
    } else {
      return NextResponse.json(
        {
          error: "No se pudo enviar el email (Resend no configurado)",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error enviando invite a Roma:", error);
    return NextResponse.json(
      { error: "Error: " + error.message },
      { status: 500 }
    );
  }
}
