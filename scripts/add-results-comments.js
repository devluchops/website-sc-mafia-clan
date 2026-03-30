import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function addComments() {
  const comments = [
    {
      post_id: 8,
      discord_username: 'lucho264849',
      content: 'Resultado:\n\nVictoria 2-0 para MAFIA]`Assassin & MAFIA]`Roma por W.O.\n\nDuckman y Xuxita no se presentaron... ¡la victoria más fácil de la historia! 😎'
    },
    {
      post_id: 9,
      discord_username: 'lucho264849',
      content: 'Resultado:\n\nVictoria contundente 2-0 para MAFIA]`Assassin & MAFIA]`Roma\n\nDominamos de principio a fin. GG!'
    }
  ];

  for (const comment of comments) {
    try {
      const result = await sql`
        INSERT INTO blog_comments (post_id, discord_username, content, created_at, updated_at)
        VALUES (
          ${comment.post_id},
          ${comment.discord_username},
          ${comment.content},
          NOW(),
          NOW()
        )
        RETURNING id, post_id
      `;
      console.log(`✅ Comentario agregado: ID ${result[0].id} en post ${result[0].post_id}`);
    } catch (error) {
      console.error(`❌ Error en post ${comment.post_id}:`, error.message);
    }
  }
}

addComments().then(() => {
  console.log('\n✨ Comentarios de resultados agregados!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
