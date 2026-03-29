const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('DATABASE_URL=')[1].replace(/^["']|["']$/g, '').trim();

const sql = neon(dbUrl);

async function createBuildOrdersTable() {
  try {
    console.log("📋 Creando tabla de build_orders...\n");

    await sql`
      CREATE TABLE IF NOT EXISTS build_orders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        race VARCHAR(50) NOT NULL,
        matchups TEXT[] DEFAULT '{}',
        description TEXT,
        build_steps JSONB,
        video_url VARCHAR(500),
        difficulty VARCHAR(50) DEFAULT 'Intermedio',
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log("✅ Tabla build_orders creada exitosamente");

    // Crear índices para mejorar el rendimiento
    await sql`
      CREATE INDEX IF NOT EXISTS idx_build_orders_race ON build_orders(race);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_build_orders_matchups ON build_orders USING GIN(matchups);
    `;

    console.log("✅ Índices creados");

    console.log("\n📊 Estructura de la tabla:");
    console.log("   - id: ID único del build order");
    console.log("   - name: Nombre del build (ej: '3 Gates No Forge Dragoon Obs')");
    console.log("   - race: Raza (Protoss, Terran, Zerg)");
    console.log("   - matchups: Array de matchups (ej: ['PPT', 'PT'])");
    console.log("   - description: Descripción completa del build");
    console.log("   - build_steps: JSON con los pasos del build");
    console.log("     Formato:");
    console.log("     [");
    console.log("       {");
    console.log("         \"supply\": 8,");
    console.log("         \"time\": \"0:30\",");
    console.log("         \"action\": \"Pylon\",");
    console.log("         \"notes\": \"Primera estructura\"");
    console.log("       },");
    console.log("       ...");
    console.log("     ]");
    console.log("   - video_url: URL del video de YouTube");
    console.log("   - difficulty: Nivel (Principiante, Intermedio, Avanzado)");
    console.log("   - tags: Array de tags (ej: ['agresivo', 'economico'])");
    console.log("   - created_at, updated_at: Timestamps");

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

createBuildOrdersTable();
