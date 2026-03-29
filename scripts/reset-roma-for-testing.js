import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function resetRomaForTesting() {
  try {
    console.log("🔄 Reseteando MAFIA]`Roma para pruebas de verificación...\n");

    // Buscar Roma
    const [roma] = await sql`
      SELECT * FROM members WHERE name = 'MAFIA]\`Roma'
    `;

    if (!roma) {
      console.log("❌ No se encontró a MAFIA]\\`Roma");
      return;
    }

    console.log("✅ Roma encontrado:");
    console.log("   - ID:", roma.id);
    console.log("   - Discord ID:", roma.discord_id);
    console.log("   - Discord Username:", roma.social_discord);
    console.log("   - Email actual:", roma.email);
    console.log("   - Email verificado:", roma.email_verified);

    // Resetear email verification
    await sql`
      UPDATE members
      SET email = NULL,
          email_verified = false,
          verification_token = NULL,
          verification_token_expires = NULL,
          phone = NULL,
          invite_sent_at = NULL
      WHERE id = ${roma.id}
    `;

    console.log("\n✅ Roma reseteado exitosamente!");
    console.log("\n📋 Estado actual:");
    console.log("   - Email: NULL (sin configurar)");
    console.log("   - Email verificado: false");
    console.log("   - Discord: " + roma.social_discord);
    console.log("   - Discord ID: " + roma.discord_id);

    console.log("\n🧪 Flujo de prueba:");
    console.log("   1. Cierra sesión en el sitio");
    console.log("   2. Inicia sesión con Discord (cuenta: " + roma.social_discord + ")");
    console.log("   3. Deberías ser redirigido a /verify-email");
    console.log("   4. Ingresa tu email y teléfono (opcional)");
    console.log("   5. Revisa tu inbox para el email de verificación");
    console.log("   6. Click en el link del email");
    console.log("   7. ¡Email verificado! Acceso completo al sitio ✅");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    throw error;
  }
}

resetRomaForTesting();
