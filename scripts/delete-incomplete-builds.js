const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('DATABASE_URL=')[1].replace(/^["']|["']$/g, '').trim();

const sql = neon(dbUrl);

// Builds que queremos MANTENER (los que están en Build_Orders.md)
const buildsToKeep = [
  "5 Gateway Goons before OBS",      // 5 Gateway Dragoon Protoss Guide
  "Double Nexus Drop Build",          // Double Nexus Drop Build
  "5 Barracks Mass BIO"               // Terran Marine/Medic Tutorial
];

async function deleteIncompleteBuilds() {
  try {
    console.log("🗑️  Eliminando builds incompletos...\n");

    // Obtener todos los builds
    const allBuilds = await sql`
      SELECT id, name FROM build_orders
    `;

    console.log(`Total de builds en BD: ${allBuilds.length}\n`);

    let deleted = 0;

    for (const build of allBuilds) {
      if (!buildsToKeep.includes(build.name)) {
        await sql`
          DELETE FROM build_orders WHERE id = ${build.id}
        `;
        console.log(`❌ Eliminado: "${build.name}"`);
        deleted++;
      } else {
        console.log(`✅ Mantenido: "${build.name}"`);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Mantenidos: ${buildsToKeep.length}`);
    console.log(`   ❌ Eliminados: ${deleted}`);
    console.log(`   📦 Total final: ${buildsToKeep.length}`);

    // Verificar builds finales
    const finalBuilds = await sql`
      SELECT id, name, race FROM build_orders ORDER BY race, name
    `;

    console.log(`\n📋 Builds restantes:`);
    finalBuilds.forEach((b, i) => {
      console.log(`   ${i + 1}. [${b.race}] ${b.name}`);
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

deleteIncompleteBuilds();
