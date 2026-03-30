import { getDb } from '../src/lib/db.js';

async function fixPostsMigration() {
  const sql = getDb();

  try {
    console.log('🚀 Adding media_type and video_url columns to posts...');
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'image'`;
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url TEXT`;
    console.log('✅ Columns added');

    console.log('🚀 Adding created_by_member_id column to posts...');
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS created_by_member_id INTEGER REFERENCES members(id)`;
    console.log('✅ Column added');

    console.log('🚀 Updating existing posts with media_type=image...');
    const updated = await sql`
      UPDATE posts
      SET media_type = 'image'
      WHERE image IS NOT NULL AND (media_type IS NULL OR media_type = '')
      RETURNING id, title, media_type
    `;
    console.log('✅ Updated posts:', updated.length);

    console.log('\n🚀 Verifying all posts...');
    const allPosts = await sql`SELECT id, title, image, media_type, video_url, created_by_member_id FROM posts ORDER BY id`;
    console.log(JSON.stringify(allPosts, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

fixPostsMigration();
