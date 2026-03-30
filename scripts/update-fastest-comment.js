import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function updateComment() {
  const newContent = 'Resultado:\n\nVictoria 3-1 para el Equipo Azul (LeGenD]ElySiuM, Kz-PeterPaM, MAFIA]`Cap_NeMo)\n\nPartidazo en el mítico mapa Fastest! El Equipo Azul dominó desde el inicio con macro impecable y coordinación brutal. El Equipo Rojo solo pudo tomar un mapa, pero los azules cerraron la serie sin piedad.\n\nMVP del torneo: MAFIA]`Cap_NeMo con defenses espectaculares y pushes devastadores. ElySiuM y PeterPaM también rompieron todo con su micro.\n\n¡3v3 Fastest de antología! 🔥⚔️';

  try {
    const result = await sql`
      UPDATE blog_comments
      SET content = ${newContent},
          updated_at = NOW()
      WHERE id = 7
      RETURNING id, post_id
    `;
    console.log(`✅ Comentario actualizado: ID ${result[0].id} en post ${result[0].post_id}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateComment().then(() => {
  console.log('\n✨ Comentario con más candela agregado! 🔥');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
