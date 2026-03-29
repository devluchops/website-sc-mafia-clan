const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('DATABASE_URL=')[1].replace(/^["']|["']$/g, '').trim();

const sql = neon(dbUrl);

const updatedBuilds = [
  {
    name: "5 Gateway Dragoon - 3v3 Fastest",
    build_steps: [
      { supply: 7, action: "Pylon" },
      { supply: 9, action: "Gateway search (o 3 Gateways si no harass)" },
      { supply: 9, action: "1 Zealot, luego Pylon" },
      { supply: 15, action: "Forge" },
      { supply: 23, time: "2:07", action: "Pylon + Cannon" },
      { supply: 24, action: "Gas (después de Cannon)" },
      { supply: 31, action: "Pylon (cuando termine anterior)" },
      { supply: 32, time: "2:51", action: "Cybernetics Core + 2nd Gas" },
      { time: "3:34", action: "3 Dragoons (cuando termine Core)" },
      { time: "3:42", action: "2 Pylons + Dragoon Range" },
      { supply: 40, time: "4:07", action: "2 más Gateways (total 5)" },
      { action: "3 Goons más (cuando terminen primeros 3)" },
      { time: "5:03", action: "Si opponent va DT: Robotics" },
      { time: "5:34", action: "START BLASTING con Range - destruir cannons" },
      { time: "6:13", action: "Observer + 3rd Gas (cuando termine Robotics)" },
      { action: "Expandir a 7 Gateways total" },
      { action: "Keep pumping Observers y Dragoons" },
      { time: "~10:00", action: "Timing: victoria bajo 10 minutos" }
    ]
  },
  {
    name: "8 Barracks Marine/Medic - 3v3 Fastest",
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
      { time: "7:30", action: "Tomar control del centro (timing Hydra ~7min)" },
      { time: "8:04", action: "+1 upgrade cuando termine Armory" },
      { action: "Ratio: 1 addon : 1 gas (4 factories = 4 gas)" },
      { action: "Nunca pushear de a poco - reunir y pushear juntos" },
      { action: "Agregar más Factories cuando tengas dinero" },
      { action: "6 Factories: agregar 3 Starports" },
      { action: "Build Valkyries contra drops" }
    ]
  }
];

async function updateSupplyFormat() {
  try {
    console.log("🔢 Actualizando formato de supply...\n");

    for (const build of updatedBuilds) {
      const [existing] = await sql`
        SELECT id FROM build_orders WHERE name = ${build.name}
      `;

      if (!existing) {
        console.log(`⚠️  Build "${build.name}" no encontrado`);
        continue;
      }

      await sql`
        UPDATE build_orders
        SET build_steps = ${JSON.stringify(build.build_steps)},
            updated_at = NOW()
        WHERE id = ${existing.id}
      `;

      console.log(`✅ Actualizado: "${build.name}"`);

      // Mostrar ejemplo de los primeros pasos
      console.log(`   Primeros pasos:`);
      build.build_steps.slice(0, 5).forEach((step, i) => {
        const parts = [];
        if (step.supply) parts.push(`Supply ${step.supply}`);
        if (step.time) parts.push(`Time ${step.time}`);
        parts.push(step.action);
        console.log(`   ${i + 1}. ${parts.join(' → ')}`);
      });
      console.log('');
    }

    console.log("✨ Formato actualizado con supply numbers visible\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

updateSupplyFormat();
