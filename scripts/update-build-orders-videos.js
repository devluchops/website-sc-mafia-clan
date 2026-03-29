const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('DATABASE_URL=')[1].replace(/^["']|["']$/g, '').trim();

const sql = neon(dbUrl);

const buildUpdates = [
  {
    name: "5 Gateway Goons before OBS",
    video_url: "https://www.youtube.com/watch?v=4hNwjACztZc",
    improved_steps: [
      { supply: 7, action: "Pylon" },
      { supply: 9, action: "Gateway", notes: "Scout for Terran/Zerg - harass if found" },
      { supply: 11, action: "Gateway (×2)" },
      { supply: 11, action: "Start 1 Zealot, then build Pylon" },
      { supply: 15, action: "Forge" },
      { supply: 23, action: "Pylon + Cannon" },
      { supply: 24, action: "Gas" },
      { supply: 31, action: "Pylon" },
      { supply: 32, action: "Cybernetics Core + 2nd Gas" },
      { trigger: "@100% Core", action: "Produce 3 Dragoons" },
      { trigger: "@3 Dragoons complete", action: "Build 2 Pylons + Research Dragoon Range" },
      { action: "Build 2 more Gateways (total 5)" },
      { trigger: "@Range researching", action: "Build 3 more Dragoons" },
      { supply: 57, action: "Robotics Facility (if needed vs DT)" },
      { trigger: "@100% Robotics", action: "Observatory + 3rd Gas" },
      { action: "Build up to 7 Gateways total" },
      { notes: "With Dragoon Range, destroy enemy cannons from safe distance" },
      { notes: "Timing: Push at ~5:30-6:00 with massed Dragoons" }
    ]
  },
  {
    name: "Double Nexus Drop Build",
    video_url: "https://www.youtube.com/watch?v=zxGHYn7Pc-s"
    // Keep existing build steps - just add video
  },
  {
    name: "5 Barracks Mass BIO",
    video_url: "https://www.youtube.com/watch?v=FdOYLkydlI4",
    improved_steps: [
      { supply: 8, action: "Barracks" },
      { supply: 9, action: "Supply Depot" },
      { supply: 10, action: "Barracks (×2)" },
      { supply: 12, action: "Barracks (3 total)" },
      { supply: 14, action: "Supply Depot" },
      { supply: 16, action: "Gas" },
      { trigger: "@Gas complete", action: "Academy (150 minerals)" },
      { supply: 23, action: "Continuous Supply Depot production" },
      { trigger: "@Academy complete", action: "Research Stim + produce 3 Medics" },
      { trigger: "@Stim researching", action: "Send 3 SCVs forward" },
      { trigger: "@3 SCVs forward", action: "Build 2 Barracks + 1 Engineering Bay" },
      { trigger: "@Stim complete", action: "Push out troops + start defensive wall at choke" },
      { trigger: "@eBay complete", action: "Research +1 Attack + 1 Turret at base + 1 Turret at choke" },
      { minerals: 800, action: "Build 2 more Barracks (5 total)" },
      { time: "~6:00", action: "Factory + 2nd Gas (transition to mech)" },
      { trigger: "@Factory complete", action: "Starport OR 2 more Factories (choice)" },
      { action: "Build 4 Armories for upgrades" },
      { gas: "4-5 total", action: "Maintain 1:1 ratio of add-ons to gas" },
      { notes: "Push timing: ~4:30-5:00 with Stim Marines + Medics" },
      { notes: "Gather army at choke before pushing - never push piecemeal" },
      { notes: "After 6 Factories, add 3 Starports for Valkyries vs drops" }
    ]
  }
];

async function updateBuildOrdersWithVideos() {
  try {
    console.log("🎥 Actualizando build orders con videos y mejoras...\n");

    for (const update of buildUpdates) {
      // Find the build order
      const [build] = await sql`
        SELECT id FROM build_orders WHERE name = ${update.name}
      `;

      if (!build) {
        console.log(`⚠️  Build "${update.name}" no encontrado`);
        continue;
      }

      // Update with video URL and optionally improved steps
      if (update.improved_steps) {
        await sql`
          UPDATE build_orders
          SET video_url = ${update.video_url},
              build_steps = ${JSON.stringify(update.improved_steps)},
              updated_at = NOW()
          WHERE id = ${build.id}
        `;
        console.log(`✅ Actualizado "${update.name}" con video y build steps mejorados`);
      } else {
        await sql`
          UPDATE build_orders
          SET video_url = ${update.video_url},
              updated_at = NOW()
          WHERE id = ${build.id}
        `;
        console.log(`✅ Actualizado "${update.name}" con video URL`);
      }
    }

    console.log("\n📊 Resumen de actualizaciones:");
    const buildsWithVideo = await sql`
      SELECT COUNT(*) as count FROM build_orders WHERE video_url IS NOT NULL
    `;
    console.log(`   🎥 Builds con video: ${buildsWithVideo[0].count}/15`);

  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  }
}

updateBuildOrdersWithVideos();
