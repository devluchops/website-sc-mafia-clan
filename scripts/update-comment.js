import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function updateComment() {
  const newContent = 'Resultado:\n\nGanó el Equipo Azul:\n- LeGenD]ElySiuM\n- Kz-PeterPaM\n- MAFIA]`Cap_NeMo';

  try {
    const result = await sql`
      UPDATE blog_comments
      SET content = ${newContent},
          updated_at = NOW()
      WHERE id = 7
      RETURNING id, member_name
    `;
    console.log(`✅ Comentario actualizado: ID ${result[0].id} por ${result[0].member_name}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateComment().then(() => {
  console.log('\n✨ Comentario actualizado!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
