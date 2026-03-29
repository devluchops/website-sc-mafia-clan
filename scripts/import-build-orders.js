const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('DATABASE_URL=')[1].replace(/^["']|["']$/g, '').trim();

const sql = neon(dbUrl);

// Datos de los 15 build orders extraídos de starcraftfastest.us
const buildOrders = [
  {
    name: "Double Nexus Drop Build",
    race: "Protoss",
    matchups: ["PP"],
    difficulty: "Avanzado",
    tags: ["2v2", "drop", "agresivo", "storm"],
    description: "Build de Protoss diseñado para juegos 2v2 que se enfoca en expansión temprana con Nexus y producción de Dark Templars con Storm para drops agresivos.",
    build_steps: [
      { supply: 8, action: "Pylon" },
      { supply: 10, action: "Nexus" },
      { supply: 11, action: "Gateway" },
      { supply: 12, action: "Forge" },
      { supply: 13, action: "Gas (×2)" },
      { supply: 14, action: "Pylon" },
      { trigger: "@100% Forge", action: "Build 1 Cannon" },
      { trigger: "@100% Gateway", action: "Build Cybernetics Core" },
      { trigger: "@100% Cybernetics Core", action: "Build Citadel of Adun, Robotics Facility, 3rd Gas" },
      { trigger: "@100% Citadel", action: "Build Templar Archive, 2 Gateways" },
      { trigger: "@100% Robotics Facility", action: "Build Robotics Bay + Observatory" },
      { trigger: "@100% Templar Archive", action: "Produce 2 DTs, 1 HT, 1 Shuttle" },
      { trigger: "@100% Robotics Bay", action: "Research Shuttle Speed" },
      { time: "5:30", action: "Deploy 3 Angle Cannons + 3 Dragoons, execute storm drop" },
      { notes: "Expand Gateways, get Zealot speed and Dragoon Range" }
    ]
  },
  {
    name: "3 Gates No Forge Dragoon Obs build",
    race: "Protoss",
    matchups: ["PPT", "PT"],
    difficulty: "Intermedio",
    tags: ["dragoon", "obs", "detección"],
    description: "Build que permite obtener Dragoons lo más rápido posible para disuadir Vultures tempranos y proporcionar detección contra amenazas enemigas.",
    build_steps: [
      { supply: 7, action: "Pylon" },
      { supply: 9, action: "Gateway", notes: "Scout for Terran" },
      { supply: 11, action: "Gateway (×2)" },
      { supply: 14, action: "Pylon" },
      { supply: 15, action: "Gas" },
      { supply: 23, action: "Pylon" },
      { supply: 24, action: "Cybernetics Core" },
      { supply: 31, action: "Pylon" },
      { trigger: "@100% Core", action: "Produce 3 Dragoons + 2nd gas" },
      { supply: 40, action: "Pylon + 1 Gateway" },
      { supply: 41, action: "Robotics Facility" },
      { trigger: "@100% Dragoons", action: "Produce 3 Zealots" },
      { supply: 48, action: "Pylon (×2)" },
      { supply: 49, action: "Research Dragoon Range" },
      { supply: 59, action: "Pylon (×2)" },
      { supply: 60, action: "Observatory" },
      { time: "4:30", action: "3rd Gas + 2 Pylons" },
      { supply: 70, action: "Pylon (×2) + Gateway" },
      { supply: 95, action: "Pylon (×3) + Forge + Citadel of Adun" }
    ]
  },
  {
    name: "Fast Mass +1 Weapon Zealot Speed Build",
    race: "Protoss",
    matchups: ["PPZ", "PZ"],
    difficulty: "Intermedio",
    tags: ["zealot", "speed", "upgrade"],
    description: "Build enfocado en mejoras de arma y velocidad de piernas para fortalecer el ejército de Zealots mientras mantiene control temprano del mapa.",
    build_steps: [
      { supply: 7, action: "Pylon" },
      { supply: 9, action: "Gateway" },
      { supply: 11, action: "Gateway (×2)", notes: "Scout" },
      { supply: 11, action: "Pylon" },
      { supply: 15, action: "Forge" },
      { supply: 23, action: "Pylon + Cannon" },
      { supply: 31, action: "Pylon + Gas" },
      { supply: 38, action: "Pylon (×2) + Cybernetics Core" },
      { supply: "38-41", action: "Gateway (×2) + continuous Zealot production" },
      { trigger: "@100% Core", action: "Build Citadel of Adun" },
      { gas: 100, action: "Research +1 Weapon Attack" },
      { gas: 150, action: "Upgrade Zealot Leg Speed" },
      { time: "5-6 min", action: "6 Cannons for defense" },
      { time: "7:30", action: "2 additional Gas + Templar Archives" }
    ]
  },
  {
    name: "Mass +1 Weapon Speed Zealot Build",
    race: "Protoss",
    matchups: ["PPP", "PP"],
    difficulty: "Intermedio",
    tags: ["zealot", "mass", "upgrade"],
    description: "Genera unidades Zealot en masa para juego en equipo con énfasis en mejoras de arma y velocidad de piernas.",
    build_steps: [
      { supply: 7, action: "Pylon" },
      { supply: 9, action: "Gateway" },
      { supply: 11, action: "Gateway (×2)", notes: "Scout" },
      { supply: 11, action: "Pylon" },
      { supply: 15, action: "Forge" },
      { supply: 31, action: "Pylon + Gateway (×2)" },
      { supply: 38, action: "Pylon (×2) + Gas" },
      { gas: 100, action: "Start Cybernetics Core" },
      { trigger: "@100% Core", action: "Build Citadel of Adun" },
      { gas: 100, action: "Research +1 Weapon Attack" },
      { gas: 150, action: "Upgrade Zealot Leg Speed" },
      { gas: 200, action: "Build Templar Archives, expand gas, start Dragoon Range" },
      { time: "5-6 min", action: "6 Cannons defense" }
    ]
  },
  {
    name: "Speed Zealot + Obs build",
    race: "Protoss",
    matchups: ["PPP"],
    difficulty: "Intermedio",
    tags: ["zealot", "observer", "3v3"],
    description: "Build para juegos 3v3 que combina producción de Speed Zealots con tecnología Observer temprana para detección de unidades.",
    build_steps: [
      { supply: 7, action: "Pylon" },
      { supply: 9, action: "Gateway" },
      { supply: 11, action: "Gateway (×2)" },
      { supply: 15, action: "Forge" },
      { supply: 23, action: "Pylon" },
      { supply: 24, action: "Cannon" },
      { supply: 31, action: "Pylon + Gas" },
      { supply: 32, action: "Gateway" },
      { supply: 40, action: "Pylon (×2) + Core" },
      { supply: 50, action: "Pylon (×2)" },
      { supply: 51, action: "Citadel of Adun + Gas" },
      { supply: 60, action: "Robotics Facility" },
      { supply: 61, action: "Pylon (×2)" },
      { supply: 70, action: "Zealot Speed Upgrade" },
      { supply: 71, action: "Pylon (×2) + +1 Weapon Attack" },
      { supply: 80, action: "Observatory + Gateway (×2)" },
      { time: "5:30", action: "3 Angle Cannons para drops" },
      { supply: 92, action: "Pylon (×3)" },
      { time: "~6:00", notes: "First Observer al centro del mapa para counter DTs" }
    ]
  },
  {
    name: "2 Robo + Speedlot Build",
    race: "Protoss",
    matchups: ["PPP", "PPZ"],
    difficulty: "Avanzado",
    tags: ["reaver", "robotics", "counter"],
    description: "Build diseñado para producir dos Reavers desde instalaciones Robóticas duales para contrarrestar grandes ejércitos de Zealots.",
    build_steps: [
      { supply: 7, action: "Pylon" },
      { supply: 9, action: "Gateway" },
      { supply: 11, action: "Gateway (×2)" },
      { supply: 15, action: "Forge" },
      { supply: 23, action: "Pylon" },
      { supply: 24, action: "Cannon + Gas" },
      { trigger: "@100% Gas", action: "Build Cybernetics Core + 2nd gas" },
      { trigger: "@100% Core", action: "Build Robotics Facility + Citadel of Adun" },
      { trigger: "@100% 1st Robo", action: "Build 2nd Robotics Facility" },
      { trigger: "@100% Citadel", action: "Research Zealot leg speed" },
      { trigger: "1st Robo", action: "Build Shuttle before Bay research" },
      { trigger: "@100% Bay", action: "Research Shuttle speed, build 2 Reavers" },
      { notes: "Usa Reavers para eliminar cannons y avanzar hacia líneas minerales" }
    ]
  },
  {
    name: "Storm drop build",
    race: "Protoss",
    matchups: ["PPP"],
    difficulty: "Avanzado",
    tags: ["storm", "drop", "templar", "3v3"],
    description: "Uno de tres roles en matchup PPP. Asegura obtener 2 Dark Templars y 1 High Templar lo más rápido posible para agresión mid-game.",
    build_steps: [
      { supply: 7, action: "Pylon" },
      { supply: 9, action: "Gateway" },
      { supply: 11, action: "Gateway (×2)" },
      { supply: 15, action: "Forge" },
      { supply: 23, action: "Pylon" },
      { supply: 24, action: "Cannon + Gas" },
      { trigger: "@100% Gas", action: "Build Cybernetics Core + 2nd Gas" },
      { trigger: "@100% Core", action: "Build Citadel of Adun + Robotics Facility" },
      { trigger: "@100% Citadel", action: "Build Templar Archive" },
      { trigger: "@100% Robotics Facility", action: "Build Shuttle" },
      { trigger: "@100% Robotics Bay", action: "Research Shuttle Speed" },
      { trigger: "@100% Templar Archive", action: "Produce 2 DTs + 1 HT" }
    ]
  },
  {
    name: "5 Gateway Goons before OBS",
    race: "Protoss",
    matchups: ["PPT", "PTZ", "PT"],
    difficulty: "Intermedio",
    tags: ["dragoon", "gateway", "mass"],
    description: "Build que prioriza producción temprana de Dragoons antes de obtener tecnología Observer para presencia en el mapa.",
    build_steps: [
      { supply: 7, action: "Pylon" },
      { supply: 9, action: "Gateway", notes: "Scout Terran" },
      { supply: 11, action: "Gateway (×2)" },
      { supply: 14, action: "Pylon" },
      { supply: 15, action: "Forge" },
      { supply: 23, action: "Pylon" },
      { supply: 24, action: "Cannon + Gas" },
      { supply: 31, action: "Pylon" },
      { supply: 32, action: "Core + Gas" },
      { supply: 40, action: "Pylon" },
      { trigger: "@100% Core", action: "Produce 3 Dragoons + Dragoon Range upgrade" },
      { action: "Build 2 Pylons" },
      { action: "Next 300 minerals: 2 Gateways then 2 Pylons" },
      { supply: 57, action: "Robotics Facility" },
      { trigger: "@100% Robo", action: "Start Observer production + 3rd Gas" },
      { notes: "After cycling 1 probe, 5 goons, 2 pylons → Citadel + Forge" }
    ]
  },
  {
    name: "3 Gate Forge Dragoon Observer Build",
    race: "Protoss",
    matchups: ["PPT", "PT"],
    difficulty: "Intermedio",
    tags: ["dragoon", "observer", "safe"],
    description: "Build que obtiene Dragoons de forma segura y produce Observers para contrarrestar DTs y Minas mientras establece crecimiento económico.",
    build_steps: [
      { supply: 7, action: "Pylon" },
      { supply: 9, action: "Gateway", notes: "Scout Terran" },
      { supply: 11, action: "Gateway (×2)" },
      { supply: 14, action: "Pylon" },
      { supply: 15, action: "Forge" },
      { supply: 23, action: "Pylon" },
      { supply: 24, action: "Cannon" },
      { supply: 24, action: "Gas" },
      { supply: 31, action: "Pylon" },
      { supply: 32, action: "Core + Gas" },
      { trigger: "@100% Core", action: "Produce 3 Dragoons" },
      { trigger: "@Dragoon completion", action: "3 Zealots" },
      { gas: 200, action: "Build Robotics Facility" },
      { gas: 150, action: "Research Dragoon range + 4th Gateway" },
      { trigger: "@100% Robotics", action: "3rd gas + Observatory" }
    ]
  },
  {
    name: "5 Barracks Mass BIO",
    race: "Terran",
    matchups: ["PUB"],
    difficulty: "Intermedio",
    tags: ["bio", "medic", "transition"],
    description: "Build de Terran que enfatiza presión con unidades bio (Medics y Stim), transicionando a unidades mecánicas (Mech) para mid-game.",
    build_steps: [
      { supply: 8, action: "Barracks" },
      { supply: 9, action: "Supply Depot" },
      { supply: 10, action: "Barracks" },
      { supply: 12, action: "Barracks" },
      { supply: 13, action: "Supply Depot" },
      { supply: 16, action: "Gas" },
      { supply: 19, action: "Supply Depot" },
      { supply: 23, action: "Academy" },
      { supply: 27, action: "Supply Depot" },
      { trigger: "@Academy completion", action: "Stim upgrade + 3 Medics" },
      { supply: 36, action: "SCVs build 1 Engineering Bay + 2 Barracks" },
      { trigger: "@Stim completion", action: "Push troops + defensive wall at choke" },
      { time: "~6 min", action: "Add 2 CCs, 1 Factory, expand gas" },
      { trigger: "After initial push", action: "2 Factories, 4 Armories, 1 Starport, 2 Gas" },
      { defense: "1 Turret near CC + 1 at choke" }
    ]
  },
  {
    name: "8/8 Mech Build",
    race: "Terran",
    matchups: ["PPT", "PT"],
    difficulty: "Intermedio",
    tags: ["mech", "vulture", "defensivo"],
    description: "Build mech de Terran con énfasis en menos agresión temprana y producción controlada de Vultures y Siege Tanks.",
    build_steps: [
      { supply: 8, action: "Supply Depot + Refinery" },
      { supply: 10, action: "Barracks" },
      { trigger: "@100% Barracks", action: "Build 2 Factories + 1 Marine" },
      { supply: "16-18", action: "Supply Depot, 3rd Factory" },
      { trigger: "@100% Factory", action: "Train 2 Vultures" },
      { trigger: "@100% Vultures", action: "2 Machine Shops + 3rd gas" },
      { trigger: "@100% Add-ons", action: "Research Spider Mines + Siege Mode" },
      { time: "4:00", action: "Engineering Bay (detection + anti-air)" },
      { situation: "vs Zealot pressure", action: "1 Bunker + 3 Marines before 3rd Factory" },
      { situation: "Supply-blocked", action: "Prioritize Starport before 5th Factory" },
      { situation: "Poor position", action: "Pivot to DropShip harassment" },
      { strategy: "Deploy Spider Mines at chokes + turrets at wall" }
    ]
  },
  {
    name: "8 Barracks Mech build",
    race: "Terran",
    matchups: ["PPT", "PTZ", "PT"],
    difficulty: "Avanzado",
    tags: ["mech", "marines", "flexible"],
    description: "Build mech de Terran usando múltiples Barracks para producción de Marines junto a unidades mech basadas en Factory, con posicionamiento flexible.",
    build_steps: [
      { supply: 8, action: "Barracks" },
      { supply: 9, action: "Supply Depot" },
      { supply: 10, action: "Refinery (Gas)" },
      { supply: 12, action: "Supply Depot" },
      { trigger: "@100% Barracks", action: "Queue 3 Marines for defense" },
      { gas: 100, action: "Build Factory + Bunker if weak position" },
      { trigger: "@100% Factory", action: "Train 1 Vulture, add Machine Shop" },
      { trigger: "@100% Machine Shop", action: "Mines (vs P) or Vulture Speed (vs T)" },
      { trigger: "@100% upgrade", action: "Siege Mode research" },
      { time: "~4:00", action: "Engineering Bay for late-game" },
      { tactical: "Play aggressively at center with Marines" },
      { position: "Mid only or PTZ" }
    ]
  },
  {
    name: "7 Hatch Mass Hydralisk",
    race: "Zerg",
    matchups: ["PUB"],
    difficulty: "Avanzado",
    tags: ["hydra", "expansion", "económico"],
    description: "Build agresivo de Zerg que prioriza expansión rápida (7 hatcheries) y producción masiva de Hydralisks con infraestructura defensiva fuerte.",
    build_steps: [
      { supply: 9, action: "Hatchery" },
      { supply: 9, action: "Drone" },
      { supply: 9, action: "Overlord" },
      { supply: 9, action: "Spawning Pool" },
      { supply: 11, action: "Hatchery" },
      { supply: 12, action: "Creep Colony" },
      { supply: 13, action: "Hatchery" },
      { supply: 15, action: "Creep Colony (×2)" },
      { supply: 16, action: "Hatchery" },
      { supply: 18, action: "Hatchery" },
      { supply: 19, action: "Hatchery" },
      { supply: "26-28", action: "Gas (×4) + Sunken Colonies (6-8)" },
      { gas: 100, action: "Build 2 Hydra Dens + 2 Chambers" },
      { gas: 200, action: "Build 2 Lairs" },
      { trigger: "@100% Hydra Den", action: "Research Hydra Speed, Range, +1 Range, +1 Carapace" },
      { trigger: "@100% Lair", action: "Research Overlord Speed + Drop" },
      { trigger: "Every 900 minerals", action: "Build 3 Hatcheries + replenish drones" },
      { trigger: "Late game", action: "Lurker upgrade + progress to Hive" }
    ]
  },
  {
    name: "2 Hatch Speed Zerglings",
    race: "Zerg",
    matchups: ["PPZ", "PZ"],
    difficulty: "Principiante",
    tags: ["zergling", "speed", "económico"],
    description: "Build de Zerg que enfatiza expansión temprana con 2 hatcheries y producción de speed lings para control del mapa.",
    build_steps: [
      { supply: 9, action: "Hatchery" },
      { supply: 9, action: "Spawning Pool" },
      { supply: 9, action: "Gas" },
      { supply: 9, action: "Drone" },
      { supply: 9, action: "Overlord" },
      { supply: 9, action: "Hatchery" },
      { supply: 9, action: "Drone" },
      { gas: 88, action: "Take drones off gas to reach 104 Gas" },
      { action: "Produce 6 Zerglings" },
      { action: "Research Zergling Speed" },
      { advantage: "1 additional drone vs standard 9 Pool" },
      { disadvantage: "Zerglings arrive slower" },
      { strategy: "After wins add drones, if losing continue ling production" }
    ]
  },
  {
    name: "9 Spawning Pool Speed Lings",
    race: "Zerg",
    matchups: ["PPZ", "PZ", "TZ"],
    difficulty: "Principiante",
    tags: ["zergling", "speed", "agresivo", "harassment"],
    description: "Estrategia agresiva de Zerg para juegos en equipo (2v2, 3v3) enfatizando mejoras de velocidad tempranas y múltiples olas de lings para control del mapa y harassment.",
    build_steps: [
      { supply: 9, action: "Spawning Pool" },
      { supply: 9, action: "Gas" },
      { minerals: 300, action: "Build Overlord" },
      { gas: 88, action: "Build 2nd Hatchery" },
      { action: "Take drones off gas individually" },
      { action: "Begin speed ling production" },
      { trigger: "300 minerals", action: "Build 3rd Hatchery" },
      { notes: "Required for PTZ and TZ matchups" },
      { notes: "Make 15+ Overlords while producing lings" }
    ]
  }
];

async function importBuildOrders() {
  try {
    console.log("📥 Importando build orders...\n");

    let imported = 0;
    let skipped = 0;

    for (const build of buildOrders) {
      // Verificar si ya existe
      const existing = await sql`
        SELECT id FROM build_orders WHERE name = ${build.name}
      `;

      if (existing.length > 0) {
        console.log(`⏭️  Saltando "${build.name}" (ya existe)`);
        skipped++;
        continue;
      }

      // Insertar build order
      await sql`
        INSERT INTO build_orders (
          name,
          race,
          matchups,
          description,
          build_steps,
          difficulty,
          tags
        ) VALUES (
          ${build.name},
          ${build.race},
          ${build.matchups},
          ${build.description},
          ${JSON.stringify(build.build_steps)},
          ${build.difficulty},
          ${build.tags}
        )
      `;

      console.log(`✅ Importado: ${build.name} (${build.race})`);
      imported++;
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Importados: ${imported}`);
    console.log(`   ⏭️  Saltados: ${skipped}`);
    console.log(`   📦 Total: ${buildOrders.length}`);

    console.log(`\n🎯 Builds por raza:`);
    const protoss = buildOrders.filter(b => b.race === "Protoss").length;
    const terran = buildOrders.filter(b => b.race === "Terran").length;
    const zerg = buildOrders.filter(b => b.race === "Zerg").length;
    console.log(`   Protoss: ${protoss}`);
    console.log(`   Terran: ${terran}`);
    console.log(`   Zerg: ${zerg}`);

    console.log(`\n💡 Nota: Los videos pueden agregarse desde el panel de admin`);

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

importBuildOrders();
