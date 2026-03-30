import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function updateComment() {
  const newContent = 'Resultado:\n\nVictoria 2-0 para MAFIA]`Assassin & MAFIA]`Roma por W.O.\n\nDuckman no pudo presentarse por problemas técnicos. ¡Victoria sin jugar!';

  try {
    const result = await sql`
      UPDATE blog_comments
      SET content = ${newContent},
          updated_at = NOW()
      WHERE id = 8
      RETURNING id, post_id
    `;
    console.log(`✅ Comentario actualizado: ID ${result[0].id} en post ${result[0].post_id}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateComment().then(() => {
  console.log('\n✨ Comentario corregido!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
