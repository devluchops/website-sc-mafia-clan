import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

async function createPost() {
  const post = JSON.parse(fs.readFileSync('/tmp/final-post.json', 'utf-8'));

  try {
    const wordCount = post.content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    const result = await sql`
      INSERT INTO posts (title, content, excerpt, image, author, date, tag, read_time, created_at, updated_at)
      VALUES (
        ${post.title},
        ${post.content},
        ${post.excerpt},
        ${post.image},
        ${post.author},
        ${post.date},
        ${post.tag},
        ${readTime},
        '2026-03-27 21:00:00'::timestamp,
        '2026-03-27 21:00:00'::timestamp
      )
      RETURNING id, title
    `;
    console.log(`✅ Post creado: ID ${result[0].id} - "${result[0].title}"`);
    console.log(`🔗 https://clanmafia.devluchops.space/post/${result[0].id}`);
  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

createPost().then(() => {
  console.log('\n✨ Post de la FINAL creado exitosamente!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
