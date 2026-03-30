---
name: tournament-post
description: Create blog posts from tournament images automatically
tags: [blog, tournament, starcraft]
---

# Tournament Post Creator

Automatically creates blog posts from tournament banner images (Challonge, custom designs, etc.).

## Instructions

When invoked with tournament images, follow this workflow:

### 1. Read and Analyze Images

For each image provided:
- Read the image file
- Extract visible information:
  - Tournament title/name
  - Players/teams involved
  - Match time
  - Organizer (if mentioned)
  - Game mode (2v2, 3v3, 1v1, etc.)
  - Any special format info (Bo3, Bo5, Fastest, etc.)

### 2. Gather Additional Information

Ask the user for missing information ONLY if not obvious:

**Required:**
- Exact date (format: YYYY-MM-DD)
- TikTok/Twitch links for cast (if applicable)
- Tournament organizer (if not in image)

**Optional:**
- Special notes or context
- Prize information
- Results (if recap) - will be added as comments later

### 3. Determine Post Structure

Based on images:
- **Same tournament, multiple matches** → Separate post per match
- **Different tournaments** → Separate post per tournament
- **Single event** → One post

### 4. Generate Post Content

For each post, create:

**Title:**
- Format: "Torneo [mode] [category]: [key matchup]"
- Example: "Torneo 2v2 MAFIA B: Duckman & Xuxita vs Assassin & Roma"

**Content:**
```markdown
🔥 **[Tournament Name] - [Additional Context]**

[Brief intro about the event]

**Equipo 1:**
- [Player 1 with MAFIA]` prefix if clan member]
- [Player 2]

**vs**

**Equipo 2:**
- [Player 3]
- [Player 4]

⏰ **Hora:** [Time] (Hora Perú)
📅 **Fecha:** [Formatted date]
🎮 **Modalidad:** [Game mode]
🏆 **Torneo:** [Tournament category]
[👤 **Organizado por:** MAFIA]`[Organizer] - if applicable]

📺 **Transmisión disponible en [Platform]:**
[@[caster_username]](link)

[Closing line about results being shared in comments]
```

**Excerpt:**
- 1-2 sentence summary
- Include key matchup
- Max 160 characters for SEO

**Tag:**
- "Recap" if event already happened
- "Noticias" if upcoming event

### 5. Process Images

For each post image:
```bash
# Generate filename: torneo-[mode]-[category]-[identifier].jpeg
cp '[source_path]' /Users/luisvalencia/Git/clan-mafia/public/posts/[filename]
```

### 6. Create Posts Script

Create a temporary script at `/tmp/create-tournament-posts.js`:

```javascript
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';

const sql = neon(process.env.DATABASE_URL);

async function createPosts() {
  const posts = [
    // JSON objects for each post
  ];

  for (const post of posts) {
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
          NOW(),
          NOW()
        )
        RETURNING id, title
      `;
      console.log(`✅ Post creado: ID ${result[0].id} - "${result[0].title}"`);
    } catch (error) {
      console.error(`❌ Error:`, error.message);
    }
  }
}

createPosts().then(() => {
  console.log('\n✨ Todos los posts fueron creados!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
```

### 7. Execute Script

```bash
DATABASE_URL="[connection_string]" NODE_OPTIONS='--no-warnings' node /tmp/create-tournament-posts.js
```

### 8. Verify and Report

Check posts are live:
```bash
curl -s https://clanmafia.devluchops.space/api/clan | jq -r '.posts | sort_by(.id) | reverse | .[0:N] | .[] | "ID: \(.id) - \(.title)"'
```

Return to user:
- ✅ Confirmation message
- Direct links to each post: `https://clanmafia.devluchops.space/post/[id]`
- Reminder that they can add results as comments in admin panel

## Important Rules

### Player Names
- **Clan members:** Always add `MAFIA]`` prefix
  - Example: Duckman → MAFIA]`Duckman
  - Example: ThaNaToZ → MAFIA]`ThaNaToZ
- **External players:** Keep name as-is
  - Example: InVoKeR.Hero, LeGenD]ElySiuM

### Date Format
- Storage: YYYY-MM-DD
- Display in content: "DD de Mes, YYYY" (Spanish)
- Example: "29 de Marzo, 2026"

### Image Naming Convention
```
torneo-[mode]-[category]-[identifier].jpeg

Examples:
- torneo-2v2-mafia-partido1.jpeg
- torneo-3v3-fastest-thanathoz.jpeg
- torneo-1v1-copamafia-semifinal.jpeg
```

### Time Zone
Always specify "(Hora Perú)" when mentioning times.

### Content Language
- All content in **Spanish**
- Professional but enthusiastic tone
- Use emojis sparingly (🔥, ⚔️, ⏰, 📅, 🎮, 🏆, 👤, 📺)

### No Results in Initial Post
Results are added later as comments. Post content says:
> "¡[Context line]! Los resultados se compartirán pronto en los comentarios."

## Example Usage

```bash
# User provides images
/tournament-post '/path/to/image1.jpeg' '/path/to/image2.jpeg'

# Skill analyzes, asks for clarifications, then creates posts automatically
```

## Output Format

```
🎉 Posts Creados Exitosamente!

✅ Post ID 8: Torneo 2v2 MAFIA B: Duckman & Xuxita vs Assassin & Roma
   🔗 https://clanmafia.devluchops.space/post/8

✅ Post ID 9: Torneo 2v2 MAFIA B: Assassin & Roma vs Sentidos & Bircoft
   🔗 https://clanmafia.devluchops.space/post/9

📱 Los posts ya están publicados y listos para compartir.
💬 Puedes agregar resultados como comentarios en el panel de admin.
```

## Error Handling

- If image is unreadable → Ask user to describe content manually
- If required info missing → Prompt user specifically
- If database insert fails → Show error and suggest manual fix
- If post already exists (duplicate) → Confirm before creating

## Notes

- Script creates posts in production database immediately
- Images are copied to public folder (committed to git later)
- Posts appear instantly on website (no deployment needed)
- All posts default to author "Admin MAFIA"
- Tag defaults to "Recap" for past events, "Noticias" for future
