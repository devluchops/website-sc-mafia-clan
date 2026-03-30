import { getDb } from '../src/lib/db.js';

async function fixVideosData() {
  const sql = getDb();

  try {
    console.log('🚀 Adding video_url column...');
    await sql`ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_url TEXT`;
    console.log('✅ Column added');

    console.log('🚀 Migrating youtube_id to video_url...');
    const result = await sql`
      UPDATE videos
      SET video_url = 'https://youtube.com/watch?v=' || youtube_id
      WHERE youtube_id IS NOT NULL AND youtube_id != ''
      RETURNING id, title, video_url
    `;
    console.log('✅ Migrated videos:', result.length);
    console.log(JSON.stringify(result, null, 2));

    console.log('\n🚀 Verifying all videos...');
    const allVideos = await sql`SELECT id, title, youtube_id, video_url FROM videos ORDER BY id`;
    console.log(JSON.stringify(allVideos, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

fixVideosData();
