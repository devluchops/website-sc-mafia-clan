import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function checkFields() {
  try {
    const [member] = await sql`SELECT * FROM members LIMIT 1`;

    if (member) {
      console.log("\n📋 Campos disponibles en la tabla members:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      Object.keys(member).forEach(key => {
        console.log(`  - ${key}: ${typeof member[key]}`);
      });
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    } else {
      console.log("⚠️  No hay miembros en la tabla");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkFields();
