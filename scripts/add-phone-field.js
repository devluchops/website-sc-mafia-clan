import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function addPhoneField() {
  try {
    console.log("📱 Agregando campo de teléfono a members...\n");

    await sql`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
    `;

    console.log("✅ Columna 'phone' agregada exitosamente");
    console.log("\n📋 El campo de teléfono es opcional y puede ser:");
    console.log("   - Número local: 966346424");
    console.log("   - Con código país: +51966346424");
    console.log("   - Formateado: +51 966 346 424");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    throw error;
  }
}

addPhoneField();
