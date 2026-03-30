import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

async function createPosts() {
  const posts = [
    JSON.parse(fs.readFileSync('/tmp/post1.json', 'utf-8')),
    JSON.parse(fs.readFileSync('/tmp/post2.json', 'utf-8')),
    JSON.parse(fs.readFileSync('/tmp/post3.json', 'utf-8'))
  ];

  for (const post of posts) {
    try {
      // Calcular read_time (aproximadamente 200 palabras por minuto)
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
          NOW(),
          NOW()
        )
        RETURNING id, title
      `;
      console.log(`✅ Post creado: ID ${result[0].id} - "${result[0].title}"`);
    } catch (error) {
      console.error(`❌ Error creando post "${post.title}":`, error.message);
    }
  }
}

createPosts().then(() => {
  console.log('\n✨ Todos los posts fueron creados exitosamente!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
