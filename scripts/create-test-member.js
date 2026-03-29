import { neon } from "@neondatabase/serverless";
import { sendInviteEmail } from "../src/lib/email.js";

const sql = neon(process.env.DATABASE_URL);

async function createTestMember() {
  try {
    console.log("🔍 Buscando miembro Roma original...");

    // Buscar Roma original
    const [roma] = await sql`
      SELECT * FROM members WHERE name = 'Roma' LIMIT 1
    `;

    if (!roma) {
      console.log("❌ No se encontró el miembro Roma original");
      return;
    }

    console.log("✅ Roma encontrado:", roma.name);

    // Crear Roma_TEST con tu email
    console.log("\n📝 Creando miembro Roma_TEST...");

    const [testMember] = await sql`
      INSERT INTO members (
        name,
        email,
        social_discord,
        social_facebook,
        social_whatsapp,
        social_tiktok,
        social_instagram,
        social_twitter,
        social_kick,
        social_youtube,
        level_terran,
        level_protoss,
        level_zerg,
        about_me,
        mmr,
        created_at,
        updated_at,
        invite_sent_at,
        last_login_at,
        discord_id
      ) VALUES (
        'Roma_TEST',
        'lvalencia1286@gmail.com',
        'roma_test',
        ${roma.social_facebook},
        ${roma.social_whatsapp},
        ${roma.social_tiktok},
        ${roma.social_instagram},
        ${roma.social_twitter},
        ${roma.social_kick},
        ${roma.social_youtube},
        ${roma.level_terran || 0},
        ${roma.level_protoss || 0},
        ${roma.level_zerg || 0},
        'Miembro de prueba para validar sistema de emails',
        ${roma.mmr || 0},
        NOW(),
        NOW(),
        NULL,
        NULL,
        NULL
      )
      RETURNING *
    `;

    console.log("✅ Miembro Roma_TEST creado:", testMember);

    // Enviar email de invitación
    console.log("\n📧 Enviando email de invitación...");

    const result = await sendInviteEmail(testMember);

    if (result) {
      console.log("✅ Email enviado exitosamente!");
      console.log("📬 ID del email:", result.id);

      // Actualizar invite_sent_at
      await sql`
        UPDATE members
        SET invite_sent_at = NOW()
        WHERE id = ${testMember.id}
      `;

      console.log("✅ invite_sent_at actualizado");
    } else {
      console.log("⚠️  No se pudo enviar el email (probablemente Resend no está configurado aún)");
    }

    console.log("\n✅ Proceso completado!");
    console.log("\n📋 Resumen:");
    console.log("- Nombre: Roma_TEST");
    console.log("- Email: lvalencia1286@gmail.com");
    console.log("- Discord: roma_test");
    console.log("\n📬 Revisa tu bandeja de entrada: lvalencia1286@gmail.com");

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

createTestMember();
