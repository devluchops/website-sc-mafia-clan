import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function updatePost() {
  const newContent = '🏆 **GRAN FINAL - Torneo Interno 2v2 Clan MAFIA**\n\nLa final más esperada del torneo interno enfrentó a dos duplas de élite del clan en un duelo épico de StarCraft: Brood War:\n\n**🔴 Team ROHE (Terran)**\n- MAFIA]`Roma\n- MAFIA]`Rohe\n\n**vs**\n\n**🟢 Team NICOLA (Zerg)**\n- MAFIA]`Nicola\n- MAFIA]`Duckman\n\n⏰ **Hora:** 9:00 PM (Hora Perú)\n📅 **Fecha:** 27 de Marzo, 2026\n🎮 **Juego:** StarCraft: Brood War\n🏆 **Torneo:** Final Torneo Interno 2v2 Clan MAFIA\n👤 **Organizado por:** Clan MAFIA\n\n📺 **Transmisión disponible en TikTok:**\n[@thanathozgameroficial](https://www.tiktok.com/@thanathozgameroficial)\n\n¡La batalla definitiva por el título de campeón! Cuatro leyendas del clan enfrentándose en la final más épica. Los resultados se compartirán pronto en los comentarios.';

  const newExcerpt = 'Gran Final del Torneo Interno 2v2 MAFIA: Team ROHE (MAFIA]`Roma & MAFIA]`Rohe) vs Team NICOLA (MAFIA]`Nicola & MAFIA]`Duckman) en StarCraft: Brood War.';

  try {
    const result = await sql`
      UPDATE posts
      SET content = ${newContent},
          excerpt = ${newExcerpt},
          updated_at = NOW()
      WHERE id = 11
      RETURNING id, title
    `;

    console.log(`✅ Post actualizado: ID ${result[0].id} - "${result[0].title}"`);
    console.log('🔗 https://clanmafia.devluchops.space/post/11');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updatePost().then(() => {
  console.log('\n✨ Post corregido exitosamente!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
