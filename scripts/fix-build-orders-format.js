const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('DATABASE_URL=')[1].replace(/^["']|["']$/g, '').trim();

const sql = neon(dbUrl);

// Formato más simple y directo
const improvedBuilds = [
  {
    name: "5 Gateway Goons before OBS",
    build_steps: [
      { time: "0:00", supply: 7, action: "Pylon" },
      { time: "0:23", supply: 9, action: "Gateway (scout)" },
      { supply: 11, action: "2x Gateway" },
      { supply: 11, action: "Zealot, luego Pylon" },
      { supply: 15, action: "Forge" },
      { time: "2:07", supply: 23, action: "Pylon + Cannon" },
      { supply: 24, action: "Gas" },
      { time: "2:42", supply: 31, action: "Pylon" },
      { supply: 32, action: "Cybernetics Core + 2nd Gas" },
      { time: "3:34", supply: 40, action: "3x Dragoon (cuando termine Core)" },
      { supply: 48, action: "2x Pylon + Dragoon Range" },
      { supply: 49, action: "2x Gateway (total 5)" },
      { time: "4:07", supply: 57, action: "3x Dragoon" },
      { supply: 57, action: "Robotics Facility (si hay DTs)" },
      { supply: 70, action: "2x Pylon + Gateway" },
      { time: "5:30", supply: 95, action: "Push con Dragoons + Range" }
    ]
  },
  {
    name: "5 Barracks Mass BIO",
    build_steps: [
      { time: "0:00", supply: 8, action: "Barracks" },
      { supply: 9, action: "Supply Depot" },
      { supply: 10, action: "Barracks" },
      { supply: 12, action: "Barracks (3 total)" },
      { time: "1:13", supply: 14, action: "Supply Depot" },
      { time: "1:48", supply: 16, action: "Refinery" },
      { supply: 19, action: "Supply Depot" },
      { time: "2:21", supply: 23, action: "Academy (cuando termine Gas)" },
      { supply: 27, action: "Supply Depot" },
      { time: "3:06", action: "Stim + 3x Medic (cuando termine Academy)" },
      { time: "3:39", action: "3 SCVs adelante: 2x Barracks + Engineering Bay" },
      { time: "4:22", action: "Push cuando termine Stim + Hacer wall en choke" },
      { time: "4:52", action: "+1 Attack + Turret base + Turret choke" },
      { time: "5:47", action: "2x Barracks más (5 total)" },
      { time: "6:00", action: "Factory + 2nd Gas (transición a Mech)" },
      { action: "4x Armory para upgrades" },
      { action: "3 Factories ó 2 Starports (elección)" },
      { time: "7:00+", action: "Timing Hydra - mantener control centro" }
    ]
  },
  {
    name: "3 Gates No Forge Dragoon Obs build",
    build_steps: [
      { supply: 7, action: "Pylon" },
      { supply: 9, action: "Gateway (scout Terran)" },
      { supply: 11, action: "2x Gateway" },
      { supply: 14, action: "Pylon" },
      { supply: 15, action: "Gas" },
      { supply: 23, action: "Pylon" },
      { supply: 24, action: "Cybernetics Core" },
      { supply: 31, action: "Pylon" },
      { action: "3x Dragoon + 2nd Gas (cuando termine Core)" },
      { supply: 40, action: "Pylon + Gateway" },
      { supply: 41, action: "Robotics Facility" },
      { action: "3x Zealot (después de Dragoons)" },
      { supply: 48, action: "2x Pylon" },
      { supply: 49, action: "Dragoon Range" },
      { supply: 59, action: "2x Pylon" },
      { supply: 60, action: "Observatory" },
      { time: "4:30", supply: 70, action: "3rd Gas + 2x Pylon + Gateway" },
      { supply: 95, action: "3x Pylon + Forge + Citadel" }
    ]
  },
  {
    name: "8/8 Mech Build",
    build_steps: [
      { supply: 8, action: "Supply Depot + Refinery" },
      { supply: 10, action: "Barracks" },
      { action: "Marine + 2x Factory (cuando termine Barracks)" },
      { supply: 16, action: "Supply Depot" },
      { supply: 18, action: "3rd Factory" },
      { action: "2x Vulture (cuando termine Factory)" },
      { action: "2x Machine Shop + 3rd Gas (cuando terminen Vultures)" },
      { action: "Spider Mines + Siege Mode (cuando terminen Add-ons)" },
      { time: "4:00", action: "Engineering Bay (detección + anti-air)" },
      { action: "vs Zealots: Bunker + 3x Marine antes de 3rd Factory" },
      { action: "Si supply-blocked: Starport antes de 5th Factory" },
      { action: "Mala posición: DropShip harassment" },
      { action: "Spider Mines en chokes + Turrets en wall" }
    ]
  },
  {
    name: "8 Barracks Mech build",
    build_steps: [
      { supply: 8, action: "Barracks" },
      { supply: 9, action: "Supply Depot" },
      { supply: 10, action: "Refinery" },
      { supply: 12, action: "Supply Depot" },
      { action: "3x Marine para defensa (cuando termine Barracks)" },
      { action: "Factory + Bunker si posición débil (a 100 gas)" },
      { action: "Vulture + Machine Shop (cuando termine Factory)" },
      { action: "Mines vs P ó Vulture Speed vs T" },
      { action: "Siege Mode (cuando termine upgrade)" },
      { time: "4:00", action: "Engineering Bay para late-game" },
      { action: "Jugar agresivo al centro con Marines" },
      { action: "Posición: Mid only o PTZ" }
    ]
  }
];

async function fixBuildOrdersFormat() {
  try {
    console.log("🔧 Mejorando formato de build orders...\n");

    for (const update of improvedBuilds) {
      const [build] = await sql`
        SELECT id FROM build_orders WHERE name = ${update.name}
      `;

      if (!build) {
        console.log(`⚠️  Build "${update.name}" no encontrado`);
        continue;
      }

      await sql`
        UPDATE build_orders
        SET build_steps = ${JSON.stringify(update.build_steps)},
            updated_at = NOW()
        WHERE id = ${build.id}
      `;

      console.log(`✅ Mejorado formato: "${update.name}"`);
    }

    console.log("\n✨ Formato mejorado con Supply → Acción + Tiempo cuando sea relevante");

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

fixBuildOrdersFormat();
