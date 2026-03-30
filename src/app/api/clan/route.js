import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = 'force-dynamic'; // Disable caching
export const revalidate = 0; // Disable caching

export async function GET() {
  try {
    const sql = getDb();

    // Obtener toda la información
    const [clanInfo] = await sql`SELECT * FROM clan_info LIMIT 1`;
    const members = await sql`SELECT * FROM members ORDER BY
      CASE rank
        WHEN 'Lider' THEN 0
        WHEN 'Oficial' THEN 1
        WHEN 'Miembro' THEN 2
        WHEN 'Recruit' THEN 3
        ELSE 4
      END, mmr DESC`;

    console.log("Total members from DB:", members.length);
    console.log("Member names:", members.map(m => m.name));
    const posts = await sql`
      SELECT
        p.*,
        m.name as created_by_member_name,
        m.avatar as created_by_member_avatar
      FROM posts p
      LEFT JOIN members m ON p.created_by_member_id = m.id
      ORDER BY p.created_at DESC
    `;
    const videos = await sql`SELECT * FROM videos ORDER BY created_at DESC`;
    const events = await sql`SELECT * FROM events ORDER BY created_at DESC`;
    const rules = await sql`SELECT * FROM clan_rules ORDER BY order_index ASC`;

    return NextResponse.json({
      clan: clanInfo || { name: "MAFIA", tagline: "El mejor clan del StarCraft en mapa Fastest", logo: "/logo.png" },
      members: members.map(m => ({
        id: m.id,
        name: m.name,
        race: m.race,
        rank: m.rank,
        level: m.level_rank || 'B',
        avatar: m.avatar,
        mmr: m.mmr,
        aboutMe: m.about_me || '',
        protossLevel: m.protoss_level || '-',
        terranLevel: m.terran_level || '-',
        zergLevel: m.zerg_level || '-',
        social: {
          facebook: m.social_facebook || '',
          discord: m.social_discord || '',
          tiktok: m.social_tiktok || '',
          kick: m.social_kick || '',
          instagram: m.social_instagram || '',
          twitter: m.social_twitter || '',
          youtube: m.social_youtube || '',
        },
      })),
      posts: posts.map(p => ({
        id: p.id,
        tag: p.tag,
        title: p.title,
        author: p.author,
        date: p.date,
        readTime: p.read_time,
        excerpt: p.excerpt,
        content: p.content,
        image: p.image,
        media_type: p.media_type,
        video_url: p.video_url,
        created_by_member_name: p.created_by_member_name,
        created_by_member_avatar: p.created_by_member_avatar,
      })),
      videos: videos.map(v => ({
        id: v.id,
        title: v.title,
        duration: v.duration,
        date: v.date,
        youtubeId: v.youtube_id,
        youtube_id: v.youtube_id, // For backward compatibility
        video_url: v.video_url,
      })),
      events: events.map(e => ({
        id: e.id,
        month: e.month,
        day: e.day,
        title: e.title,
        desc: e.description,
        description: e.description,
        status: e.status,
        date: e.date,
        link: e.link,
      })),
      rules: rules.map(r => ({
        category: r.category,
        title: r.title,
        description: r.description,
      })),
    });
  } catch (error) {
    console.error("Error:", error);
    // Si hay error, devolver datos del archivo como fallback
    const clanData = await import("@/data/clan-data");
    return NextResponse.json({
      clan: clanData.CLAN,
      members: clanData.MEMBERS,
      posts: clanData.POSTS,
      videos: clanData.VIDEOS,
      events: clanData.EVENTS,
    });
  }
}
