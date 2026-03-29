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
