import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function createTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS blog_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        subscribed_at TIMESTAMP DEFAULT NOW(),
        unsubscribed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Tabla blog_subscribers creada');

    await sql`CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON blog_subscribers(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_blog_subscribers_active ON blog_subscribers(is_active)`;
    console.log('✅ Índices creados');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTable().then(() => {
  console.log('\n✨ Base de datos lista para suscriptores!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
