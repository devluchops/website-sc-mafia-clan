import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function addComment() {
  const comment = {
    post_id: 11,
    discord_username: 'lucho264849',
    content: 'Resultado Final:\n\nVictoria contundente 3-0 para el Team NICOLA (MAFIA]`Nicola & MAFIA]`Duckman)\n\nEl equipo Zerg dominó completamente la final. MAFIA]`Nicola y MAFIA]`Duckman jugaron de manera impecable, sin darle ninguna oportunidad al Team ROHE.\n\nLos Terran de MAFIA]`Roma y MAFIA]`Rohe intentaron resistir, pero la presión Zerg fue demasiado. Tres mapas seguidos, tres victorias aplastantes.\n\n¡Felicidades a los campeones del torneo! 🏆👑'
  };

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
    console.log(`🔗 https://clanmafia.devluchops.space/post/${result[0].post_id}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addComment().then(() => {
  console.log('\n✨ Comentario de la FINAL agregado!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
