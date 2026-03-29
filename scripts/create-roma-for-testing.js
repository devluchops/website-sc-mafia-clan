import { neon } from "@neondatabase/serverless";
import { sendInviteEmail } from "../src/lib/email.js";

const sql = neon(process.env.DATABASE_URL);

async function createRomaForTesting() {
  try {
    console.log("👤 Creando MAFIA]\\`Roma con email para recibir invite...\n");

    // Crear Roma con solo Discord username
    const [roma] = await sql`
      INSERT INTO members (
        name,
        social_discord,
        race,
        rank,
        avatar,
        mmr,
        terran_level,
        protoss_level,
        zerg_level,
        about_me,
        email,
        email_verified,
        phone,
        discord_id,
        created_at,
        updated_at
      ) VALUES (
        'MAFIA]\`Roma',
        'lucho264849',
        'Protoss',
        'Líder',
        'https://www.xtrafondos.com/wallpapers/protoss-de-starcraft-4426.jpg',
        0,
        'C',
        'B+',
        'B',
        'Líder del Clan MAFIA',
        'lvalencia1286@gmail.com',
        false,
        NULL,
        NULL,
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    console.log("✅ MAFIA]\\`Roma creado exitosamente!");

    // Enviar email de invitación
    console.log("\n📧 Enviando email de invitación...");
    try {
      const result = await sendInviteEmail(roma);
      if (result) {
        console.log("✅ Email de invitación enviado a:", roma.email);
        console.log("   ID del email:", result.id);

        // Actualizar invite_sent_at
        await sql`
          UPDATE members
          SET invite_sent_at = NOW()
          WHERE id = ${roma.id}
        `;
        console.log("✅ invite_sent_at actualizado");
      } else {
        console.log("⚠️  No se pudo enviar el email (Resend no configurado o dominio no verificado)");
      }
    } catch (emailError) {
      console.error("⚠️  Error enviando email:", emailError.message);
      console.log("   El miembro fue creado pero el email no se envió");
      console.log("   Verifica que:");
      console.log("   - RESEND_API_KEY esté configurado");
      console.log("   - devluchops.space esté verificado en Resend");
    }
    console.log("\n📋 Detalles:");
    console.log("   - ID:", roma.id);
    console.log("   - Nombre:", roma.name);
    console.log("   - Discord username:", roma.social_discord);
    console.log("   - Discord ID:", roma.discord_id || "NULL (se asignará al login)");
    console.log("   - Email:", roma.email || "NULL");
    console.log("   - Email verificado:", roma.email_verified);
    console.log("   - Rango:", roma.rank);

    console.log("\n🧪 Flujo de prueba:");
    console.log("   1. Ve a https://clanmafia.devluchops.space");
    console.log("   2. Cierra sesión si estás logueado");
    console.log("   3. Click en 'Iniciar Sesión'");
    console.log("   4. Inicia sesión con Discord (cuenta: lucho264849)");
    console.log("   5. ⚠️  Deberías ser redirigido automáticamente a /verify-email");
    console.log("   6. Ingresa tu email: lvalencia1286@gmail.com");
    console.log("   7. (Opcional) Ingresa tu teléfono: +51 966 346 424");
    console.log("   8. Click en 'Enviar Código de Verificación'");
    console.log("   9. Revisa tu inbox para el email de verificación");
    console.log("   10. Click en el link del email");
    console.log("   11. ¡Email verificado! Deberías tener acceso completo ✅");

    console.log("\n💡 Nota importante:");
    console.log("   - El dominio devluchops.space debe estar verificado en Resend");
    console.log("   - Si el email no llega, revisa https://resend.com/emails");
    console.log("   - Revisa también tu carpeta de spam");

  } catch (error) {
    console.error("\n❌ Error:", error.message);

    if (error.message.includes("duplicate key")) {
      console.log("\n💡 Ya existe un miembro con ese nombre o Discord username");
      console.log("   Ejecuta este comando para ver los miembros:");
      console.log("   SELECT id, name, social_discord FROM members WHERE social_discord = 'lucho264849';");
    }

    throw error;
  }
}

createRomaForTesting();
