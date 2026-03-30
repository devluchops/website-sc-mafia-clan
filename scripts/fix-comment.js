import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function fixComment() {
  try {
    const result = await sql`
      UPDATE blog_comments
      SET discord_username = 'lucho264849',
          member_name = NULL,
          updated_at = NOW()
      WHERE id = 7
      RETURNING id, discord_username
    `;
    console.log(`✅ Comentario corregido: ID ${result[0].id} - Discord: ${result[0].discord_username}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixComment().then(() => {
  console.log('\n✨ Ahora debería mostrar tu usuario correctamente!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
