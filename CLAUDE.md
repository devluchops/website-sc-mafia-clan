<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->

## Vercel MCP Integration

**ALWAYS use Vercel MCP when available** for managing Vercel infrastructure:

- **Environment Variables**: Use `vercel env add/rm/ls` commands via Bash instead of manual dashboard changes
- **Deployments**: Use `mcp__vercel__list_deployments`, `mcp__vercel__get_deployment` to check deployment status
- **Projects**: Use `mcp__vercel__list_projects`, `mcp__vercel__get_project` to get project information
- **Documentation**: Use `mcp__vercel__search_vercel_documentation` to search Vercel docs when needed
- **Logs**: Use `mcp__vercel__get_runtime_logs` to debug deployment issues

**Workflow for configuration changes:**
1. Check if user has authenticated with Vercel MCP (`/mcp` command)
2. If authenticated, use MCP tools and Vercel CLI via Bash
3. If not authenticated, provide manual instructions for Vercel dashboard

**Project Information:**
- Team ID: `team_3qdITWUtIGbwk7lA7TrcRele`
- Team Slug: `lvalencia1286-2164s-projects`
- Project ID: `prj_Q1wY8w8gKgCGlvKOuaysDpArcjLP`
- Project Name: `website-sc-mafia-clan`
- Production Domain: `clanmafia.devluchops.space`

## Challonge Tournament Integration

**Configuration:**
- API integration for managing StarCraft II tournaments
- Credentials stored in Vercel environment variables
- Public tournament display on main site + dedicated tournament pages

**Environment Variables (Required):**
```bash
CHALLONGE_API_KEY=<your-api-key>          # Private server-side
CHALLONGE_USERNAME=<your-username>        # Private server-side
NEXT_PUBLIC_CHALLONGE_USERNAME=<username> # Public client-side (for iframe embed URLs)
```

**IMPORTANT - Adding Environment Variables:**
When adding env vars via `vercel env add`, ensure NO trailing newlines or whitespace:
- Paste the value and DO NOT press Enter after
- Or add `.trim()` in code when reading: `process.env.VAR?.trim()`

**API Endpoints:**
1. **Public Tournaments API**: `/api/tournaments`
   - GET with `?id=tournament_url` - Get specific tournament with participants/matches
   - GET without params - List active tournaments (pending, underway, awaiting_review)
   - No authentication required

2. **Admin Tournaments API**: `/api/admin/tournaments`
   - GET - List all tournaments or get specific with participants/matches
   - POST - Create tournament, start tournament, add/remove participants, update match results
   - DELETE - Remove tournament
   - Requires `is_admin` or `can_publish_events` permission

**Tournament Display:**
- Main page shows active tournaments in dedicated section
- Click tournament card → dedicated page at `/tournaments/[url]`
- Tournament page shows: description, participants, live bracket iframe from Challonge

**Implementation Files:**
- `src/lib/challonge.js` - Challonge API client (trim env vars!)
- `src/app/api/tournaments/route.js` - Public API
- `src/app/api/admin/tournaments/route.js` - Admin API
- `src/app/page-client.js` - Main page tournament display
- `src/app/tournaments/[url]/page.js` - Dedicated tournament page

**Tournament Types:**
- `single elimination` - Eliminación directa
- `double elimination` - Doble eliminación (bracket de perdedores)
- `round robin` - Todos contra todos (fase de grupos)
- `swiss` - Sistema suizo

**Group Stage + Playoffs Workflow:**

Para torneos con fase de grupos seguida de playoffs (ej: Copa del Mundo):

1. **Crear torneo de grupos**:
   ```javascript
   {
     name: "CopaMAFIA2025 - Grupos",
     tournament_type: "round robin",
     url: "copamafia2025-grupos"
   }
   ```

2. **Finalizar fase de grupos**:
   ```javascript
   POST /api/admin/tournaments
   { action: "finalize", tournamentId: "grupos-id" }
   ```

3. **Obtener clasificados**:
   ```javascript
   GET /api/admin/tournaments?id=grupos-id&participants=true
   // Ordenar por final_rank o wins y tomar top N
   ```

4. **Crear torneo de playoffs**:
   ```javascript
   {
     name: "CopaMAFIA2025 - Playoffs",
     tournament_type: "single elimination",
     url: "copamafia2025-playoffs"
   }
   ```

5. **Agregar clasificados**:
   ```javascript
   POST /api/admin/tournaments
   {
     action: "bulk_add_participants",
     tournamentId: "playoffs-id",
     participants: [{name: "Player1", seed: 1}, ...]
   }
   ```

Ver ejemplo completo en: `scripts/tournament-group-to-playoff-example.js`

**Common Issues:**
- **401 Unauthorized**: Check for trailing newlines in API key (add `.trim()`)
- **500 Error on Vercel**: Verify environment variables are set in Production
- **"No hay torneos activos"**: Check API response is array, not error object

## Email System

**Resend Configuration:**
- Integration installed via Vercel Marketplace
- Domain: `devluchops.space` (verification required)
- From address: `noreply@devluchops.space`
- Free tier: 3,000 emails/month

**Email Notifications:**
1. **Member Invites**: Automatic when email + Discord username configured (only if user hasn't logged in)
2. **Comment Replies**: Sent when someone replies to your comment
3. **New Posts**: All members with email notified when new blog post published

**Testing Email System:**

1. **Verify Domain First:**
   - Go to https://resend.com/domains
   - Check that `devluchops.space` shows ✅ green checkmarks
   - DNS propagation can take 2-15 minutes

2. **Test Invite Email:**
   ```bash
   # Create test member via admin panel at https://clanmafia.devluchops.space/admin
   # OR use this script:
   DATABASE_URL='your_db_url' \
   RESEND_FROM_EMAIL='Clan MAFIA <noreply@devluchops.space>' \
   NEXT_PUBLIC_SITE_URL='https://clanmafia.devluchops.space' \
   node scripts/create-simple-test-member.js
   ```
   - Email will only send from Vercel (production) where RESEND_API_KEY exists
   - Local scripts won't send emails unless you set RESEND_API_KEY locally

3. **Check Email Logs:**
   - View all sent emails at https://resend.com/emails
   - Check delivery status (Delivered, Queued, Failed)
   - View email content and metadata

**Creating Test Data:**

```bash
# Create a test member with email
node -e "
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);
await sql\`
  INSERT INTO members (name, email, social_discord, race, rank, avatar, mmr, created_at, updated_at)
  VALUES ('Test_User', 'test@example.com', 'test_discord', 'Protoss', 'Miembro', '', 0, NOW(), NOW())
\`;
"
```

Or use the script: `scripts/create-simple-test-member.js`

## Multi-Language Support

**Language System:**
- Site supports multiple languages (currently Spanish primary)
- Can be extended to support English, Portuguese, etc.
- User language preference should be stored in session/cookies
- All UI text should be externalized for translation

**Implementation Notes:**
- Currently all content is in Spanish
- When adding features, keep text separate from logic
- Consider using i18n library for future expansion
- Database content (blog posts, rules) can have language field

**Future Enhancements:**
- Add language selector in UI
- Store user language preference
- Translate UI components
- Multi-language blog posts

## Admin Panel & Permissions Checklist

**CRITICAL: When adding ANY new feature/content type, ALWAYS verify:**

1. **Database Schema:**
   - [ ] Table created with proper fields
   - [ ] Timestamps (created_at, updated_at)
   - [ ] Foreign keys if needed
   - [ ] Indexes for performance

2. **Permissions System:**
   - [ ] Add `can_manage_X` column to `user_permissions` table
   - [ ] Update `/api/admin/permissions/route.js` GET query
   - [ ] Update `/api/admin/permissions/route.js` PUT mutation
   - [ ] Update admin UI permissions section to show new permission

3. **Admin Panel UI:**
   - [ ] Add new section tab in `/admin/page.js`
   - [ ] Create CRUD interface (Create, Read, Update, Delete)
   - [ ] Check permission: `session?.user?.permissions?.is_admin || session?.user?.permissions?.can_manage_X`
   - [ ] Add loading states and error handling

4. **API Routes:**
   - [ ] Create `/api/admin/X/route.js`
   - [ ] Protect GET with authentication (allow public if needed)
   - [ ] Protect POST/PUT/DELETE with permission check
   - [ ] Return proper HTTP status codes (200, 400, 403, 500)

5. **Frontend Display:**
   - [ ] Create section in main page (`page-client.js`)
   - [ ] Add to navigation tabs
   - [ ] Persist active tab with URL hash
   - [ ] Handle loading and empty states

**Example Permission Flow:**
```javascript
// In API route
const session = await getServerSession(authOptions);
if (!session?.user?.permissions?.is_admin && !session?.user?.permissions?.can_manage_X) {
  return Response.json({ error: "No autorizado" }, { status: 403 });
}
```

**Current Features & Permissions:**
- **Blog Posts**: `can_publish_blog`
- **Videos**: `can_publish_videos`
- **Events**: `can_publish_events`
- **Rules**: `can_edit_rules`
- **Members**: `can_manage_members`
- **Permissions**: `can_manage_permissions`
- **Build Orders**: `can_manage_build_orders` (to be implemented)

## Documentation Guidelines

**IMPORTANT - Single Source of Truth:**
- **ONLY maintain CLAUDE.md** as the project documentation file
- **DO NOT create** new markdown files (e.g., SETUP.md, GUIDE.md, NOTES.md, etc.)
- **DO NOT split** documentation into multiple files
- All project instructions, setup guides, troubleshooting, and reference material should be consolidated in CLAUDE.md
- Keep README.md minimal (project description, quick start, link to CLAUDE.md if needed)
- If documentation grows large, use clear headers and sections within CLAUDE.md

**When to Update CLAUDE.md:**
- Adding new features or integrations
- Solving recurring bugs or issues
- Documenting environment setup or deployment procedures
- Adding API documentation or architectural decisions

---

## Design System & UI Components

### Theme Colors (CRITICAL - Always use these exact values)

```javascript
const gold = "#c9a84c";           // Primary gold color
const darkGold = "#3d3525";       // Dark gold for borders
const cardBg = "#252220";         // Card background
const bg = "#1e1b18";             // Main background
const textMuted = "#8b7b5e";      // Muted text
const textLight = "#e8dcc0";      // Light text
const textBody = "#d4c5a0";       // Body text

// Race Colors
const RACE_COLORS = {
  Terran: { bg: "rgba(100,160,200,0.12)", border: "rgba(100,160,200,0.35)", text: "#7ab8d4" },
  Zerg: { bg: "rgba(160,100,180,0.12)", border: "rgba(160,100,180,0.35)", text: "#c09ad8" },
  Protoss: { bg: "rgba(201,168,76,0.12)", border: "rgba(201,168,76,0.35)", text: "#c9a84c" },
};
```

### Custom Select/Dropdown Style (Use for ALL selects)

```javascript
const getSelectStyle = (customStyle = {}) => ({
  width: "100%",
  padding: "10px 36px 10px 14px",
  background: `linear-gradient(180deg, ${bg} 0%, #16130f 100%)`,
  border: `1.5px solid ${darkGold}`,
  borderRadius: 6,
  color: textLight,
  fontSize: 14,
  fontFamily: "inherit",
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23c9a84c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  transition: "all 0.2s ease",
  outline: "none",
  ...customStyle,
});
```

**IMPORTANT:** Always use this style for select elements in forms (admin panel, join form, etc.)

### Input Field Style (Standard for forms)

```javascript
// For text inputs, email, tel, etc.
{
  width: "100%",
  padding: "8px 12px",
  background: bg,                    // #1e1b18
  border: `1px solid ${darkGold}`,   // #3d3525
  borderRadius: 4,
  color: textLight,                  // #e8dcc0
  fontSize: 13,
  outline: "none",
}

// Labels
{
  display: "block",
  color: textMuted,                  // #8b7b5e
  fontSize: 11,
  marginBottom: 4,
}
```

### Avatar Component

**Default Avatars by Race (CRITICAL):**
- **Zerg**: Hydralisk - `https://static.wikia.nocookie.net/aliens/images/4/4d/Hydralisk.jpg`
- **Protoss**: Zealot - `https://static.wikia.nocookie.net/starcraft/images/5/52/Zealot_SC1_Art1.jpg`
- **Terran**: Marine - `https://static.wikia.nocookie.net/starcraft/images/f/fd/Marine_SC-FL1_Art1.jpg`

**Fallback order:**
1. Custom avatar (if member has one)
2. Race default avatar (Hydralisk/Zealot/Marine)
3. Initial letter with race color (last resort if images fail)

**Image Proxy:**
- Always use `https://images.weserv.nl/?url=` for external images
- Prevents CORS issues
- Format: `https://images.weserv.nl/?url=${externalUrl}&w=${width}&h=${height}&fit=cover`

### Members Grid Layout (Roster Section)

**Grid Configuration:**
```javascript
{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 16,
}
```

**Responsive Breakpoints:**
- Desktop (>900px): 4 columns
- Tablet (600-900px): 3 columns
- Large mobile (400-600px): 2 columns
- Small mobile (<400px): 1 column

**Member Card Structure:**
- Vertical layout (flexDirection: "column")
- Avatar: 80px, centered at top
- Level badge: Absolute positioned top-right corner
- Centered content: Name, Rank, Race badges, MMR
- Join date: `⭐ Miembro desde [mes año]` (if available)
- Social icons: Centered at bottom
- Hover effect: `translateY(-4px)` with shadow

**Search Filter:**
- Filters by: name, rank, level, race
- Real-time (onChange)
- Case-insensitive
- Placed above sort buttons

### Modal Patterns

**Join Clan Modal (Floating Button):**
- Floating button: Fixed position, bottom: 32px, right: 32px
- Button text: "⭐ Únete al Clan"
- Modal overlay: `rgba(0, 0, 0, 0.85)` background
- Form fields:
  - Nombre completo *
  - Nickname Player * (NOT "Tag/Apodo")
  - Email *
  - WhatsApp (optional)
  - Raza principal * (select with custom style)
  - Discord (optional)
  - ¿Por qué quieres unirte al clan? * (textarea)

**Member Detail Modal:**
- Triggered by clicking member card
- Shows: Avatar (100px), Name, Rank, Level, MMR
- Sections:
  - SOBRE MÍ (aboutMe field or placeholder)
  - NIVELES POR RAZA (Protoss/Terran/Zerg grid)
  - REDES SOCIALES (only if `hasSocial()` returns true)
- **CRITICAL:** Hide "REDES SOCIALES" section if member has no social networks

### Database Fields (Members Table)

**Essential Fields:**
- `name` - Player name
- `email` - For notifications
- `social_discord` - Discord username
- `rank` - Lider, Oficial, Miembro, Recruit
- `level_rank` - Overall level (S, A+, A, B+, B, C+, C, D+, D)
- `protoss_level`, `terran_level`, `zerg_level` - Race-specific levels
- `main_race` - Primary race (Protoss/Terran/Zerg)
- `races_played` - Races the player uses
- `mmr` - Match Making Rating
- `avatar` - URL to avatar image
- `birth_date` - DATE field (YYYY-MM-DD)
- `join_date` - DATE field (YYYY-MM-DD) - Display as "Miembro desde mes año"
- `aboutMe` - TEXT field for profile description
- `last_login_at` - Timestamp of last login
- `invite_sent_at` - Timestamp when invite email was sent
- `email_verified` - BOOLEAN
- `created_at`, `updated_at` - Timestamps

**Social Media Fields:**
- `social_facebook`, `social_instagram`, `social_twitter`
- `social_discord`, `social_kick`, `social_twitch`
- `social_tiktok`, `social_youtube`

### Date Handling (CRITICAL)

**DatePicker Component (react-datepicker):**
```javascript
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Safe date parsing function
const safeParseDate = (dateString) => {
  if (!dateString) return null;
  try {
    const dateOnly = dateString.split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;
    const date = new Date(dateOnly + 'T00:00:00');
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    return null;
  }
};

// Usage
<DatePicker
  selected={safeParseDate(formData.birth_date)}
  onChange={(date) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      updateField("birth_date", formattedDate);
    } else {
      updateField("birth_date", null);
    }
  }}
  dateFormat="dd/MM/yyyy"
  showYearDropdown
  scrollableYearDropdown
  isClearable
  className="custom-datepicker"
  calendarClassName="custom-calendar"
/>
```

**Date Display Format:**
- Storage: `YYYY-MM-DD` (PostgreSQL DATE)
- Display: "mes año" (ej: "ene 2024")
```javascript
new Date(member.joinDate).toLocaleDateString('es-PE', {
  month: 'short',
  year: 'numeric'
})
```

### Email System (Join Requests)

**Resend Configuration:**
- API Key: `RESEND_API_KEY` in .env.local
- From Email: `RESEND_FROM_EMAIL` (e.g., "Clan MAFIA <noreply@devluchops.space>")
- To: `lvalencia1286@gmail.com` (hardcoded in `sendJoinRequestNotification`)

**Join Request Email:**
- Triggered when form submitted at `/api/join-request`
- Contains: Name, Nickname Player, Email, WhatsApp, Race, Discord, Reason
- HTML template with gold theme matching site design
- Function: `sendJoinRequestNotification()` in `/src/lib/email.js`

### Common Patterns & Conventions

**Always Use:**
- Inline styles (no CSS modules or styled-components)
- Cinzel font for headings: `fontFamily: "'Cinzel', serif"`
- Variables for colors (gold, darkGold, bg, cardBg, etc.)
- Image proxy for external images
- `hasSocial()` function to check if member has social networks
- Safe date parsing for DatePicker components

**Never:**
- Hardcode colors - always use theme variables
- Use native select styling - always apply custom select style
- Show empty sections (e.g., "REDES SOCIALES" without social links)
- Use `new Date()` directly without validation for user input dates

### Server Management

**Restarting Dev Server:**
```bash
pkill -f "next dev"
npm run dev
```

**Environment Changes:**
- Always restart server after .env.local changes
- Variables are only read at server startup
- Check logs for configuration issues

### Troubleshooting

**"RangeError: Invalid time value":**
- Use `safeParseDate()` function before passing to DatePicker
- Never use `new Date(string)` directly on user input

**Select dropdown not showing custom style:**
- Verify using `getSelectStyle()` or inline gradient background
- Check for `appearance: "none"` to remove native styling
- Ensure golden arrow SVG is included in backgroundImage

**Images not loading:**
- Use image proxy: `https://images.weserv.nl/?url=`
- Check CORS policy if loading directly
- Verify URL format (remove http:// prefix for proxy)

**Modal showing empty sections:**
- Always use conditional rendering with `hasSocial()` or similar
- Check if data exists before rendering section headers
