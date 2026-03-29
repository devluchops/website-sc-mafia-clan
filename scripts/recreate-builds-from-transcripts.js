const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('DATABASE_URL=')[1].replace(/^["']|["']$/g, '').trim();

const sql = neon(dbUrl);

// Builds extraídos DIRECTAMENTE de los transcripts del .md
const buildsFromTranscripts = [
  {
    name: "5 Gateway Dragoon - 3v3 Fastest",
    race: "Protoss",
    matchups: ["PPP", "PPT", "PPZ"],
    difficulty: "Intermedio",
    tags: ["dragoon", "range", "3v3", "timing"],
    description: "Build efectivo contra Mech y otras composiciones. Gateway search opcional para harass temprano. Presión fuerte con Dragoons + Range timing bajo 10 minutos.",
    video_url: "https://www.youtube.com/watch?v=4hNwjACztZc",
    build_steps: [
      { supply: 7, action: "Pylon" },
      { action: "Gateway search (o 3 Gateways si no harass)" },
      { action: "1 Zealot, luego Pylon" },
      { supply: 15, action: "Forge" },
      { time: "2:07", supply: 23, action: "Pylon + Cannon" },
      { supply: 24, action: "Gas (después de Cannon)" },
      { action: "Cuando termine Pylon: otro Pylon" },
      { time: "2:51", supply: 32, action: "Cybernetics Core + 2nd Gas (a 200 gas)" },
      { time: "3:34", action: "3 Dragoons (cuando termine Core)" },
      { time: "3:42", action: "2 Pylons + Dragoon Range" },
      { time: "4:07", action: "2 más Gateways (total 5)" },
      { action: "3 Goons más (cuando terminen primeros 3)" },
      { time: "5:03", action: "Si opponent va DT: Robotics" },
      { time: "5:34", action: "Start blasting con Range - destruir cannons" },
      { time: "6:13", action: "Observer + 3rd Gas cuando termine Robotics" },
      { action: "Expandir a 7 Gateways total" },
      { action: "Keep pumping Observers y Dragoons" },
      { time: "10:00", action: "Timing: victoria bajo 10 minutos" }
    ]
  },
  {
    name: "8 Barracks Marine/Medic - 3v3 Fastest",
    race: "Terran",
    matchups: ["PPT", "PTZ", "TTZ"],
    difficulty: "Principiante",
    tags: ["bio", "marine", "medic", "stim", "3v3"],
    description: "Build básico de bio para 3v3 cuando posición es mala o pierdes race comp. Presión con Stim Marines + Medics, transición a Mech mid-game. Muy fundamental.",
    video_url: "https://www.youtube.com/watch?v=FdOYLkydlI4",
    build_steps: [
      { supply: 8, action: "Barracks" },
      { supply: 9, action: "Supply Depot" },
      { supply: 10, action: "Barracks" },
      { supply: 12, action: "Barracks (3 total)" },
      { supply: 14, action: "Supply Depot" },
      { supply: 16, action: "Refinery" },
      { action: "Queue 2 Marines en primera Barracks" },
      { time: "2:21", action: "Academy (cuando termine Gas, 150 minerals)" },
      { action: "Construir Depots constantemente" },
      { time: "3:13", action: "Stim + 3 Medics (cuando termine Academy)" },
      { time: "3:39", action: "3 SCVs adelante para construir" },
      { time: "3:55", action: "2 Barracks + Engineering Bay (con los 3 SCVs)" },
      { time: "4:22", action: "PUSH cuando termine Stim + hacer wall en choke" },
      { time: "4:52", action: "+1 Attack + Turret base + Turret choke" },
      { action: "Siempre construir SCVs (delay máximo 3 segundos)" },
      { time: "5:47", action: "2 más Barracks a 800 minerals (5 total)" },
      { time: "6:05", action: "Factory + 2nd Gas - TRANSICIÓN A MECH" },
      { time: "6:52", action: "4 Armories cuando termine Factory" },
      { time: "7:14", action: "Starport cuando termine Factory" },
      { time: "7:30", action: "Tomar control del centro - timing Hydra 7min" },
      { time: "8:04", action: "+1 upgrade cuando termine Armory" },
      { action: "Ratio: 1 addon : 1 gas (4 factories = 4 gas)" },
      { action: "Nunca pushear de a poco - reunir y pushear juntos" },
      { action: "Agregar más Factories cuando tengas dinero" },
      { action: "6 Factories: agregar 3 Starports" },
      { action: "Build Valkyries contra drops" }
    ]
  }
];

async function recreateBuildsFromTranscripts() {
  try {
    console.log("🔄 Recreando builds desde transcripts...\n");

    // 1. Eliminar TODOS los builds existentes
    await sql`DELETE FROM build_orders`;
    console.log("❌ Eliminados todos los builds existentes\n");

    // 2. Crear builds desde transcripts
    for (const build of buildsFromTranscripts) {
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
      console.log(`✅ Creado: "${build.name}" (${build.race})`);
    }

    console.log(`\n📊 Builds creados desde transcripts:`);
    console.log(`   Total: ${buildsFromTranscripts.length}`);

    // Verificar builds finales
    const finalBuilds = await sql`
      SELECT id, name, race, difficulty FROM build_orders ORDER BY race, name
    `;

    console.log(`\n📋 Builds en base de datos:`);
    finalBuilds.forEach((b, i) => {
      console.log(`   ${i + 1}. [${b.race}] ${b.name} - ${b.difficulty}`);
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

recreateBuildsFromTranscripts();
