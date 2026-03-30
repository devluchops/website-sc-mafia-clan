import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const posts = {
  8: {
    content: '🔥 **Torneo 2v2 MAFIA B - Partido 1**\n\nEmocionante enfrentamiento en el torneo interno del clan MAFIA donde se midieron dos duplas de élite:\n\n**Equipo 1:**\n- MAFIA]`Duckman\n- MAFIA]`Xuxita\n\n**vs**\n\n**Equipo 2:**\n- MAFIA]`Assassin\n- MAFIA]`Roma\n\n⏰ **Hora:** 9:00 PM (Hora Perú)\n📅 **Fecha:** 29 de Marzo, 2026\n🎮 **Modalidad:** 2v2\n🏆 **Torneo:** MAFIA B (Interno)\n\n📺 **Transmisión disponible en TikTok:**\n[@starcraftcast](https://www.tiktok.com/@starcraftcast)\n\n¡Una batalla épica entre miembros del clan! Los resultados se compartirán pronto en los comentarios.',
    excerpt: 'Torneo interno 2v2 MAFIA B: MAFIA]`Duckman & MAFIA]`Xuxita enfrentaron a MAFIA]`Assassin & MAFIA]`Roma en un duelo de élite.'
  },
  9: {
    content: '🔥 **Torneo 2v2 MAFIA B - Partido 2**\n\nEl torneo interno continuó con otro emocionante enfrentamiento entre miembros del clan MAFIA:\n\n**Equipo 1:**\n- MAFIA]`Assassin\n- MAFIA]`Roma\n\n**vs**\n\n**Equipo 2:**\n- MAFIA]`Sentidos\n- MAFIA]`Bircoft\n\n⏰ **Hora:** 10:00 PM (Hora Perú)\n📅 **Fecha:** 29 de Marzo, 2026\n🎮 **Modalidad:** 2v2\n🏆 **Torneo:** MAFIA B (Interno)\n\n📺 **Transmisión disponible en TikTok:**\n[@starcraftcast](https://www.tiktok.com/@starcraftcast)\n\n¡La competencia se intensifica! Los resultados se compartirán pronto en los comentarios.',
    excerpt: 'Torneo interno 2v2 MAFIA B: MAFIA]`Assassin & MAFIA]`Roma se enfrentaron a MAFIA]`Sentidos & MAFIA]`Bircoft en el segundo partido de la noche.'
  },
  10: {
    content: '⚔️ **StarCraft Fastest - Torneo 3v3**\n\nGran evento organizado por **MAFIA]`ThaNaToZ** donde se enfrentaron dos equipos de alto nivel en el mítico mapa Fastest:\n\n**🔴 Equipo Rojo:**\n- InVoKeR.Hero\n- Aris_Az\n- El_Zurdo\n\n**vs**\n\n**🔵 Equipo Azul:**\n- LeGenD]ElySiuM\n- Kz-PeterPaM\n- MAFIA]`Cap_NeMo\n\n⏰ **Hora:** 7:00 PM (Hora Perú)\n📅 **Fecha:** 29 de Marzo, 2026\n🎮 **Modalidad:** 3v3 Fastest\n👤 **Organizado por:** MAFIA]`ThaNaToZ\n\n📺 **Transmisión disponible en TikTok:**\n[@thanathozgameroficial](https://www.tiktok.com/@thanathozgameroficial)\n\n¡Una batalla legendaria en el clásico mapa Fastest! Los resultados se compartirán pronto en los comentarios.',
    excerpt: 'Torneo 3v3 Fastest organizado por MAFIA]`ThaNaToZ: InVoKeR.Hero, Aris_Az y El_Zurdo vs LeGenD]ElySiuM, Kz-PeterPaM y MAFIA]`Cap_NeMo.'
  }
};

async function fixPosts() {
  for (const [id, data] of Object.entries(posts)) {
    try {
      const result = await sql`
        UPDATE posts
        SET content = ${data.content},
            excerpt = ${data.excerpt},
            updated_at = NOW()
        WHERE id = ${parseInt(id)}
        RETURNING id, title
      `;
      console.log(`✅ Post ${id} actualizado: "${result[0].title}"`);
    } catch (error) {
      console.error(`❌ Error en post ${id}:`, error.message);
    }
  }
}

fixPosts().then(() => {
  console.log('\n✨ Todos los posts corregidos!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
