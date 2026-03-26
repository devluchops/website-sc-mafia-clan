import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

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
    const posts = await sql`SELECT * FROM posts ORDER BY created_at DESC`;
    const videos = await sql`SELECT * FROM videos ORDER BY created_at DESC`;
    const events = await sql`SELECT * FROM events ORDER BY created_at DESC`;

    return NextResponse.json({
      clan: clanInfo || { name: "MAFIA", tagline: "El mejor clan del StarCraft en mapa Fastest", logo: "/logo.png" },
      members: members.map(m => ({
        name: m.name,
        race: m.race,
        rank: m.rank,
        avatar: m.avatar,
        mmr: m.mmr,
      })),
      posts: posts.map(p => ({
        tag: p.tag,
        title: p.title,
        author: p.author,
        date: p.date,
        readTime: p.read_time,
        excerpt: p.excerpt,
      })),
      videos: videos.map(v => ({
        title: v.title,
        duration: v.duration,
        date: v.date,
        youtubeId: v.youtube_id,
      })),
      events: events.map(e => ({
        month: e.month,
        day: e.day,
        title: e.title,
        desc: e.description,
        status: e.status,
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
