import { NextResponse } from "next/server";
import { sendJoinRequestNotification } from "@/lib/email";

export async function POST(request) {
  try {
    const { name, tag, email, phone, race, discord, reason } = await request.json();

    console.log('📋 Nueva solicitud recibida:', { name, tag, email, race });

    // Validar campos obligatorios
    if (!name || !tag || !email || !race || !reason) {
      console.error('❌ Faltan campos obligatorios');
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Verificar configuración de Resend
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_tu_api_key_aqui') {
      console.error('❌ Resend API key no configurada correctamente');
      return NextResponse.json(
        { error: "El servicio de email no está configurado. Contacta al administrador." },
        { status: 500 }
      );
    }

    console.log('📧 Intentando enviar email...');

    // Enviar notificación al administrador
    const result = await sendJoinRequestNotification({
      name,
      tag,
      email,
      phone: phone || null,
      race,
      discord: discord || null,
      reason,
    });

    if (result) {
      console.log('✅ Email enviado correctamente:', result);
    } else {
      console.warn('⚠️  Email no enviado (Resend no configurado o falló silenciosamente)');
    }

    return NextResponse.json({
      success: true,
      message: "Solicitud enviada correctamente. Nos pondremos en contacto contigo pronto.",
    });
  } catch (error) {
    console.error("❌ Error procesando solicitud de unión:", error);
    console.error("Stack trace:", error.stack);
    return NextResponse.json(
      { error: `Error al procesar la solicitud: ${error.message}` },
      { status: 500 }
    );
  }
}
