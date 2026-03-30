import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function updateComment() {
  const newContent = 'Resultado Final:\n\nVictoria contundente 3-0 para el Team NICOLA (MAFIA]`Nicola & MAFIA]`Duckman)\n\nEl equipo Zerg dominó completamente la final. MAFIA]`Nicola y MAFIA]`Duckman jugaron de manera impecable, sin darle ninguna oportunidad al Team ROHE.\n\nLos Protoss de MAFIA]`Roma y MAFIA]`Rohe intentaron resistir, pero la presión Zerg fue demasiado. Tres mapas seguidos, tres victorias aplastantes.\n\n¡Felicidades a los campeones del torneo! 🏆👑';

  try {
    const result = await sql`
      UPDATE blog_comments
      SET content = ${newContent},
          updated_at = NOW()
      WHERE id = 10
      RETURNING id, post_id
    `;
    console.log(`✅ Comentario actualizado: ID ${result[0].id} en post ${result[0].post_id}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateComment().then(() => {
  console.log('\n✨ Comentario de la FINAL corregido!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
