import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function addEmailVerification() {
  try {
    console.log("📝 Agregando columnas de verificación de email...\n");

    // Agregar columnas de verificación
    await sql`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP
    `;

    console.log("✅ Columnas agregadas:");
    console.log("   - email_verified (boolean)");
    console.log("   - verification_token (varchar)");
    console.log("   - verification_token_expires (timestamp)");

    // Verificar usuarios que ya tienen discord_id (ya hicieron login)
    // Los marcamos como verificados automáticamente
    const result = await sql`
      UPDATE members
      SET email_verified = true
      WHERE discord_id IS NOT NULL
        AND email IS NOT NULL
        AND email != ''
        AND last_login_at IS NOT NULL
      RETURNING id, name, email
    `;

    if (result.length > 0) {
      console.log("\n✅ Usuarios existentes marcados como verificados:");
      result.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
    }

    console.log("\n✅ Migración completada!");
    console.log("\n📋 Próximos pasos:");
    console.log("   1. Implementar flujo de verificación");
    console.log("   2. Enviar emails de verificación a nuevos usuarios");
    console.log("   3. Bloquear acceso a usuarios no verificados");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    throw error;
  }
}

addEmailVerification();
