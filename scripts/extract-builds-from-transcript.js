const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('DATABASE_URL=')[1].replace(/^["']|["']$/g, '').trim();

const sql = neon(dbUrl);

// Builds extraídos del transcript con tiempos exactos
const buildsFromTranscript = [
  {
    name: "5 Gateway Dragoon - 3v3 Fastest",
    race: "Protoss",
    matchups: ["PPP", "PPT", "PPZ"],
    difficulty: "Intermedio",
    tags: ["dragoon", "range", "3v3", "timing"],
    description: "Build efectivo contra Mech y composiciones mixtas. Gateway search opcional para harass. Timing crítico con Dragoon Range para destruir cannons.",
    video_url: "https://www.youtube.com/watch?v=4hNwjACztZc",
    build_steps: [
      { time: "0:23", supply: 7, action: "Pylon" },
      { time: "0:50", supply: 9, action: "Gateway search (o 3 Gateways)" },
      { time: "1:23", action: "1 Zealot, luego Pylon" },
      { time: "1:39", supply: 15, action: "Forge" },
      { time: "2:07", supply: 23, action: "Pylon + Cannon" },
      { time: "2:17", supply: 24, action: "Cannon + Gas" },
      { time: "2:34", supply: 31, action: "Pylon" },
      { time: "2:51", supply: 32, action: "Cybernetics Core + 2nd Gas (200 gas)" },
      { time: "3:34", action: "3 Dragoons (cuando Core esté listo)" },
      { time: "3:42", action: "2 Pylons + Dragoon Range" },
      { time: "4:07", supply: 40, action: "2 más Gateways (total 5 Gates)" },
      { time: "4:23", action: "3 Dragoons más" },
      { time: "5:03", action: "Si opponent DT: Robotics" },
      { time: "5:34", action: "START BLASTING - Range completo, destruir cannons" },
      { time: "6:13", action: "Observer + 3rd Gas" },
      { time: "7:00+", action: "Expandir a 7 Gateways total" },
      { time: "~10:00", action: "Timing victoria" }
    ]
  },
  {
    name: "8 Barracks Marine/Medic - 3v3 Fastest",
    race: "Terran",
    matchups: ["PPT", "PTZ", "TTZ"],
    difficulty: "Principiante",
    tags: ["bio", "marine", "medic", "stim", "3v3"],
    description: "Build fundamental de bio para mala posición o race comp perdido. Presión con Stim Marines/Medics, transición a Mech. Ratio 1:1 addon:gas.",
    video_url: "https://www.youtube.com/watch?v=FdOYLkydlI4",
    build_steps: [
      { time: "0:24", supply: 8, action: "Barracks" },
      { time: "0:40", supply: 9, action: "Supply Depot" },
      { time: "0:47", supply: 10, action: "Barracks" },
      { time: "1:32", supply: 12, action: "3rd Barracks" },
      { time: "1:41", supply: 14, action: "Supply Depot" },
      { time: "1:48", supply: 16, action: "Refinery" },
      { action: "Queue 2 Marines primera Barracks" },
      { time: "2:21", action: "Academy (150 minerals cuando Gas esté listo)" },
      { time: "2:44", action: "Construir Depots constantemente" },
      { time: "3:06", action: "Siempre construir SCVs (delay máx 3 seg)" },
      { time: "3:13", action: "Stim + 3 Medics (cuando Academy esté listo)" },
      { time: "3:39", action: "3 SCVs adelante" },
      { time: "3:55", action: "2 Barracks + Engineering Bay (con 3 SCVs)" },
      { time: "4:22", action: "PUSH cuando Stim esté listo + wall en choke" },
      { time: "4:52", action: "+1 Attack + Turret base + Turret choke" },
      { time: "5:47", action: "2 más Barracks a 800 minerals (5 total)" },
      { time: "6:05", action: "Factory + 2nd Gas - TRANSICIÓN MECH" },
      { time: "6:52", action: "4 Armories cuando Factory esté listo" },
      { time: "7:14", action: "Starport cuando Factory esté listo" },
      { time: "7:30", action: "Tomar control centro (timing Hydra ~7min)" },
      { time: "8:04", action: "+1 upgrade cuando Armory esté listo" },
      { time: "9:26", action: "Never stop Depots" },
      { time: "9:34", action: "Ratio 1:1 - addon:gas (4 factories = 4 gas)" },
      { action: "Nunca pushear de a poco - reunir Army primero" },
      { action: "6 Factories: agregar 3 Starports" },
      { action: "Valkyries contra drops" }
    ]
  }
];

async function extractBuildsFromTranscript() {
  try {
    console.log("⏱️  Extrayendo builds del transcript con tiempos...\n");

    // Eliminar builds existentes
    await sql`DELETE FROM build_orders`;
    console.log("🗑️  Builds anteriores eliminados\n");

    // Crear builds con tiempos del transcript
    for (const build of buildsFromTranscript) {
      await sql`
        INSERT INTO build_orders (
          name,
          race,
          matchups,
          description,
          build_steps,
          video_url,
          difficulty,
          tags
        ) VALUES (
          ${build.name},
          ${build.race},
          ${build.matchups},
          ${build.description},
          ${JSON.stringify(build.build_steps)},
          ${build.video_url},
          ${build.difficulty},
          ${build.tags}
        )
      `;

      console.log(`✅ ${build.name}`);
      console.log(`   Pasos: ${build.build_steps.length}`);
      console.log(`   Primeros pasos:`);
      build.build_steps.slice(0, 5).forEach((step, i) => {
        const parts = [];
        if (step.time) parts.push(step.time);
        if (step.supply) parts.push(`Supply ${step.supply}`);
        parts.push(step.action);
        console.log(`     ${i + 1}. ${parts.join(' → ')}`);
      });
      console.log('');
    }

    console.log("✨ Builds actualizados con tiempos del transcript\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

extractBuildsFromTranscript();
