import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function addComment() {
  const comment = {
    post_id: 10,
    discord_username: 'MAFIA]`Roma',
    member_name: 'MAFIA]`Roma',
    content: '**Resultado:**\n\nGanó el Equipo Azul:\n- LeGenD]ElySiuM\n- Kz-PeterPaM\n- MAFIA]`Cap_NeMo'
  };

  try {
    const result = await sql`
      INSERT INTO blog_comments (post_id, discord_username, member_name, content, created_at, updated_at)
      VALUES (
        ${comment.post_id},
        ${comment.discord_username},
        ${comment.member_name},
        ${comment.content},
        NOW(),
        NOW()
      )
      RETURNING id, post_id, member_name
    `;
    console.log(`✅ Comentario agregado: ID ${result[0].id} en post ${result[0].post_id} por ${result[0].member_name}`);
    console.log(`🔗 https://clanmafia.devluchops.space/post/${result[0].post_id}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addComment().then(() => {
  console.log('\n✨ Comentario publicado!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
