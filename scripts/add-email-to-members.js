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
    console.log('Agregando columna email a la tabla members...');

    // Agregar columna email si no existe
    await sql`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS email TEXT NULL
    `;

    console.log('✅ Columna email agregada exitosamente');

    // Agregar columna para trackear si ya recibieron invite
    await sql`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS invite_sent_at TIMESTAMP NULL
    `;

    console.log('✅ Columna invite_sent_at agregada exitosamente');

    // Agregar columna para trackear último login
    await sql`
      ALTER TABLE members
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL
    `;

    console.log('✅ Columna last_login_at agregada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
