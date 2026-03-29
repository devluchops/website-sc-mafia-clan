const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('DATABASE_URL=')[1].replace(/^["']|["']$/g, '').trim();

const sql = neon(dbUrl);

const buildsWithAllTimes = [
  {
    name: "5 Gateway Dragoon - 3v3 Fastest",
    description: "Build efectivo contra Mech y otras composiciones. Búsqueda con Gateway opcional para hostigar temprano. Timing crítico con Rango de Dragoon para destruir cañones enemigos desde distancia segura.",
    build_steps: [
      { time: "0:23", supply: 7, action: "Pylon" },
      { time: "0:50", supply: 9, action: "Gateway búsqueda (o 3 Gateways si no hostigas)" },
      { time: "1:23", action: "1 Zealot, luego Pylon" },
      { time: "1:39", supply: 15, action: "Forge" },
      { time: "2:07", supply: 23, action: "Pylon + Cañón" },
      { time: "2:17", supply: 24, action: "Cañón + Gas" },
      { time: "2:34", supply: 31, action: "Pylon" },
      { time: "2:51", supply: 32, action: "Cybernetics Core + 2do Gas (200 gas)" },
      { time: "3:34", action: "3 Dragoons (cuando Core esté listo)" },
      { time: "3:42", action: "2 Pylons + Rango de Dragoon" },
      { time: "4:07", supply: 40, action: "2 Gateways más (total 5 Gates)" },
      { time: "4:23", action: "3 Dragoons más" },
      { time: "5:03", action: "Si opponent usa DT: Robotics" },
      { time: "5:34", action: "EMPEZAR ATAQUE - Rango completo, destruir cañones" },
      { time: "6:13", action: "Observer + 3er Gas" },
      { time: "7:23", action: "Expandir a 7 Gateways total" },
      { time: "9:56", action: "Timing de victoria bajo 10 minutos" }
    ]
  },
  {
    name: "8 Barracks Marine/Medic - 3v3 Fastest",
    description: "Build fundamental de bio para mala posición o composición racial perdida. Presión con Stim Marines + Medics, transición a Mech mid-game. Ratio 1:1 addon:gas. Build muy básico para aprender.",
    build_steps: [
      { time: "0:24", supply: 8, action: "Barracks" },
      { time: "0:40", supply: 9, action: "Supply Depot" },
      { time: "0:47", supply: 10, action: "Barracks" },
      { time: "1:32", supply: 12, action: "3er Barracks" },
      { time: "1:41", supply: 14, action: "Supply Depot" },
      { time: "1:48", supply: 16, action: "Refinery" },
      { time: "1:23", action: "Encolar 2 Marines en primer Barracks" },
      { time: "2:21", action: "Academy (150 minerals cuando Gas esté listo)" },
      { time: "2:44", action: "Construir Depots constantemente" },
      { time: "3:06", action: "Siempre construir SCVs (delay máximo 3 seg)" },
      { time: "3:13", action: "Stim + 3 Medics (cuando Academy esté listo)" },
      { time: "3:39", action: "3 SCVs adelante" },
      { time: "3:55", action: "2 Barracks + Engineering Bay (con 3 SCVs)" },
      { time: "4:22", action: "EMPUJAR cuando Stim esté listo + wall en choke" },
      { time: "4:52", action: "+1 Ataque + Torreta base + Torreta choke" },
      { time: "5:47", action: "2 Barracks más a 800 minerals (5 total)" },
      { time: "6:05", action: "Factory + 2do Gas - TRANSICIÓN A MECH" },
      { time: "6:11", action: "Nunca empujar de a poco - reunir Army primero" },
      { time: "6:52", action: "4 Armories cuando Factory esté listo" },
      { time: "7:14", action: "Starport cuando Factory esté listo" },
      { time: "7:30", action: "Tomar control del centro (timing Hydra ~7min)" },
      { time: "8:04", action: "+1 upgrade cuando Armory esté listo" },
      { time: "9:26", action: "Nunca parar de construir Depots" },
      { time: "9:34", action: "Ratio 1:1 - addon:gas (4 factories = 4 gas)" },
      { time: "10:17", action: "6 Factories: agregar 3 Starports" },
      { time: "10:25", action: "Valkyries contra drops" }
    ]
  }
];

async function addMissingTimes() {
  try {
    console.log("⏰ Agregando tiempos faltantes del .md...\n");

    for (const build of buildsWithAllTimes) {
      const [existing] = await sql`
        SELECT id FROM build_orders WHERE name = ${build.name}
      `;

      if (!existing) {
        console.log(`⚠️  Build "${build.name}" no encontrado`);
        continue;
      }

      await sql`
        UPDATE build_orders
        SET description = ${build.description},
            build_steps = ${JSON.stringify(build.build_steps)},
            updated_at = NOW()
        WHERE id = ${existing.id}
      `;

      console.log(`✅ ${build.name}`);
      console.log(`   Total pasos: ${build.build_steps.length}`);
      console.log(`   Pasos con tiempo: ${build.build_steps.filter(s => s.time).length}`);
      console.log('');
    }

    console.log("✨ Tiempos agregados correctamente\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

addMissingTimes();
