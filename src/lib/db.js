import { neon } from '@neondatabase/serverless';

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurado');
  }
  return neon(process.env.DATABASE_URL);
}

// Esquema de la base de datos
export const schema = {
  createTables: async (sql) => {
    // Tabla: información del clan
    await sql`
      CREATE TABLE IF NOT EXISTS clan_info (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tagline TEXT NOT NULL,
        logo VARCHAR(500) DEFAULT '/logo.png',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Tabla: miembros
    await sql`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        race VARCHAR(50) NOT NULL,
        rank VARCHAR(100) NOT NULL,
        avatar VARCHAR(500),
        mmr INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Tabla: posts
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        tag VARCHAR(100) NOT NULL,
        title TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        date VARCHAR(100) NOT NULL,
        read_time VARCHAR(50) NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Tabla: videos
    await sql`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        duration VARCHAR(50) NOT NULL,
        date VARCHAR(100) NOT NULL,
        youtube_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Tabla: eventos
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        month VARCHAR(50) NOT NULL,
        day VARCHAR(10) NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('✅ Tablas creadas exitosamente');
  },

  // Poblar con datos iniciales
  seedData: async (sql, initialData) => {
    // Insertar información del clan
    const clanExists = await sql`SELECT * FROM clan_info LIMIT 1`;
    if (clanExists.length === 0) {
      await sql`
        INSERT INTO clan_info (name, tagline, logo)
        VALUES (${initialData.CLAN.name}, ${initialData.CLAN.tagline}, ${initialData.CLAN.logo})
      `;
    }

    // Insertar miembros
    const membersExist = await sql`SELECT * FROM members LIMIT 1`;
    if (membersExist.length === 0) {
      for (const member of initialData.MEMBERS) {
        await sql`
          INSERT INTO members (name, race, rank, avatar, mmr)
          VALUES (${member.name}, ${member.race}, ${member.rank}, ${member.avatar}, ${member.mmr})
        `;
      }
    }

    // Insertar posts
    const postsExist = await sql`SELECT * FROM posts LIMIT 1`;
    if (postsExist.length === 0) {
      for (const post of initialData.POSTS) {
        await sql`
          INSERT INTO posts (tag, title, author, date, read_time, excerpt)
          VALUES (${post.tag}, ${post.title}, ${post.author}, ${post.date}, ${post.readTime}, ${post.excerpt})
        `;
      }
    }

    // Insertar videos
    const videosExist = await sql`SELECT * FROM videos LIMIT 1`;
    if (videosExist.length === 0) {
      for (const video of initialData.VIDEOS) {
        await sql`
          INSERT INTO videos (title, duration, date, youtube_id)
          VALUES (${video.title}, ${video.duration}, ${video.date}, ${video.youtubeId || ''})
        `;
      }
    }

    // Insertar eventos
    const eventsExist = await sql`SELECT * FROM events LIMIT 1`;
    if (eventsExist.length === 0) {
      for (const event of initialData.EVENTS) {
        await sql`
          INSERT INTO events (month, day, title, description, status)
          VALUES (${event.month}, ${event.day}, ${event.title}, ${event.desc}, ${event.status})
        `;
      }
    }

    console.log('✅ Datos iniciales cargados');
  }
};
