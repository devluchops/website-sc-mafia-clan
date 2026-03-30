const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const dbUrlLine = lines.find(line => line.trim().startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('DATABASE_URL=')[1].replace(/^["']|["']$/g, '').trim();

const sql = neon(dbUrl);

(async () => {
  try {
    console.log('Agregando columnas de fechas a la tabla members...');

    // Agregar columna birth_date (fecha de nacimiento)
    await sql`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS birth_date DATE NULL
    `;

    console.log('✅ Columna birth_date agregada exitosamente');

    // Agregar columna join_date (fecha de ingreso al clan)
    await sql`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS join_date DATE NULL
    `;

    console.log('✅ Columna join_date agregada exitosamente');

    console.log('\n✅ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
