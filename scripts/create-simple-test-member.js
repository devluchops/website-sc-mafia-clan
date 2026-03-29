import { neon } from "@neondatabase/serverless";
import { sendInviteEmail } from "../src/lib/email.js";

const sql = neon(process.env.DATABASE_URL);

async function createTestMember() {
  try {
    console.log("📝 Creando miembro de prueba...\n");

    // Crear miembro de prueba
    const [testMember] = await sql`
      INSERT INTO members (
        name,
        email,
        social_discord,
        race,
        rank,
        avatar,
        mmr,
        terran_level,
        protoss_level,
        zerg_level,
        about_me,
        created_at,
        updated_at,
        invite_sent_at,
        last_login_at,
        discord_id
      ) VALUES (
        'Test_Member',
        'lvalencia1286@gmail.com',
        'test_user_123',
        'Protoss',
        'Miembro',
        'https://www.xtrafondos.com/wallpapers/protoss-de-starcraft-4426.jpg',
        0,
        'C',
        'B',
        'C',
        'Miembro de prueba para validar sistema de emails',
        NOW(),
        NOW(),
        NULL,
        NULL,
        NULL
      )
      RETURNING *
    `;

    console.log("✅ Miembro creado:");
    console.log("   - ID:", testMember.id);
    console.log("   - Nombre:", testMember.name);
    console.log("   - Email:", testMember.email);
    console.log("   - Discord:", testMember.social_discord);

    // Enviar email de invitación
    console.log("\n📧 Enviando email de invitación...");

    const result = await sendInviteEmail(testMember);

    if (result) {
      console.log("✅ Email enviado exitosamente!");
      console.log("   - ID del email:", result.id);

      // Actualizar invite_sent_at
      await sql`
        UPDATE members
        SET invite_sent_at = NOW()
        WHERE id = ${testMember.id}
      `;

      console.log("✅ invite_sent_at actualizado");
    } else {
      console.log("⚠️  No se pudo enviar el email");
      console.log("   Posibles razones:");
      console.log("   - Resend no está configurado (RESEND_API_KEY faltante)");
      console.log("   - Dominio no verificado en Resend");
    }

    console.log("\n✅ Proceso completado!");
    console.log("\n📋 Resumen:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Miembro:", testMember.name);
    console.log("Email:", testMember.email);
    console.log("Discord:", testMember.social_discord);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n📬 Revisa tu bandeja de entrada:");
    console.log("   lvalencia1286@gmail.com");
    console.log("\n💡 Si no llegó el email, verifica:");
    console.log("   1. Dominio verificado en https://resend.com/domains");
    console.log("   2. Carpeta de spam/correo no deseado");
    console.log("   3. Logs en https://resend.com/emails");

  } catch (error) {
    console.error("\n❌ Error:", error.message);

    if (error.message.includes("duplicate key")) {
      console.log("\n💡 Sugerencia: Ya existe un miembro de prueba.");
      console.log("   Ejecuta este comando para eliminarlo:");
      console.log("   DELETE FROM members WHERE name = 'Test_Member';");
    }

    throw error;
  }
}

createTestMember();
