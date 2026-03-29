const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('DATABASE_URL=')[1].replace(/^["']|["']$/g, '').trim();

const sql = neon(dbUrl);

async function addBuildOrdersPermission() {
  try {
    console.log("🔧 Agregando permiso can_manage_build_orders...\n");

    // Agregar columna can_manage_build_orders
    await sql`
      ALTER TABLE user_permissions
      ADD COLUMN IF NOT EXISTS can_manage_build_orders BOOLEAN DEFAULT false
    `;

    console.log("✅ Columna can_manage_build_orders agregada\n");

    // Verificar que la columna existe
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'user_permissions'
      AND column_name = 'can_manage_build_orders'
    `;

    if (result.length > 0) {
      console.log("📊 Columna verificada:");
      console.log(`   Nombre: ${result[0].column_name}`);
      console.log(`   Tipo: ${result[0].data_type}`);
      console.log(`   Default: ${result[0].column_default}`);
    }

    console.log("\n✨ Migración completada exitosamente\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

addBuildOrdersPermission();
