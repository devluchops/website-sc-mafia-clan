import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";
import { createVerificationToken } from "@/lib/verification";
import { sendVerificationEmail } from "@/lib/email";

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { email, phone } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email requerido" },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Obtener el miembro actual
    const [member] = await sql`
      SELECT * FROM members
      WHERE discord_id = ${session.user.discordId}
    `;

    if (!member) {
      return NextResponse.json(
        { error: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar email y/o phone si son diferentes
    if (member.email !== email || (phone && member.phone !== phone)) {
      await sql`
        UPDATE members
        SET email = ${email},
            phone = ${phone || null},
            email_verified = false
        WHERE id = ${member.id}
      `;
    }

    // Crear token de verificación
    const token = await createVerificationToken(member.id);

    // Enviar email de verificación
    try {
      await sendVerificationEmail({
        email,
        name: member.name || session.user.name,
        token,
      });

      return NextResponse.json({
        message: "Email de verificación enviado",
        email,
      });
    } catch (emailError) {
      console.error("Error enviando email:", emailError);

      // Si Resend no está configurado, devolver mensaje apropiado
      if (emailError.message?.includes("Resend")) {
        return NextResponse.json({
          message: "Email guardado pero no se pudo enviar verificación (Resend no configurado)",
          email,
        });
      }

      throw emailError;
    }
  } catch (error) {
    console.error("Error en send-verification:", error);
    return NextResponse.json(
      { error: "Error enviando verificación: " + error.message },
      { status: 500 }
    );
  }
}
