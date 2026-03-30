# Open Graph Tags - Production Deployment Checklist

## Pre-Deployment

### 1. Update Vercel Environment Variable
Go to Vercel dashboard → Settings → Environment Variables:
- Variable: `NEXT_PUBLIC_SITE_URL`
- Value: `https://clanmafia.devluchops.space`
- Environments: Production, Preview, Development

### 2. Test Locally
- [x] Test post route: `http://localhost:3000/post/4`
- [x] Test member route: `http://localhost:3000/member/16`
- [x] Test event route (with valid ID)
- [x] Verify 404 for invalid IDs
- [x] Check Open Graph meta tags
- [x] Check Twitter Card meta tags

## Post-Deployment

### 1. Test Production URLs
Once deployed, test these URLs work:
- `https://clanmafia.devluchops.space/post/4`
- `https://clanmafia.devluchops.space/member/16`
- `https://clanmafia.devluchops.space/event/{valid-id}`

### 2. Verify Meta Tags in Production
```bash
curl -s https://clanmafia.devluchops.space/post/4 | grep "og:title"
```

### 3. Test with Social Media Validators

#### WhatsApp/Facebook Debugger:
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter URL: `https://clanmafia.devluchops.space/post/4`
3. Click "Debug"
4. Verify preview shows:
   - ✅ Post title
   - ✅ Post excerpt
   - ✅ Post image

#### Twitter Card Validator:
1. Go to: https://cards-dev.twitter.com/validator
2. Enter URL: `https://clanmafia.devluchops.space/post/4`
3. Click "Preview card"
4. Verify card displays correctly

#### LinkedIn Post Inspector:
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter URL and inspect

### 4. Test Navigation Flow

**From home page:**
- Click on a blog post → URL should change to `/post/{id}`
- Close modal → URL should return to `/#blog`
- Click on a member → URL should change to `/member/{id}`
- Close modal → URL should return to `/#roster`

**Direct links:**
- Share `/post/4` on WhatsApp
- Click the link from WhatsApp
- Verify it opens directly to that post

### 5. Test Hash URL Upgrade (Backward Compatibility)

Open these URLs in browser and verify they auto-upgrade:
- `https://clanmafia.devluchops.space/#post-4` → Should redirect to `/post/4`
- `https://clanmafia.devluchops.space/#member-16` → Should redirect to `/member/16`
- `https://clanmafia.devluchops.space/#event-5` → Should redirect to `/event/5`

### 6. Browser Testing

Test in different browsers:
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Known Limitations

1. **Old hash URLs still work** - Backward compatible, auto-upgrade on page load
2. **Meta tags only update on server render** - Client-side navigation won't update meta tags (this is expected behavior)
3. **Image URLs must be absolute** - Relative paths won't work in social media previews

## Troubleshooting

### Issue: Meta tags not showing in WhatsApp
**Solution:**
1. Clear WhatsApp cache (not possible directly)
2. Use Facebook Debugger to "Fetch new scrape information"
3. This will update WhatsApp's cache

### Issue: Images not loading in social previews
**Check:**
- Image URL is absolute (includes domain)
- Image is publicly accessible (no authentication)
- Image format is supported (JPEG, PNG, GIF, WebP)
- Image size is reasonable (<8MB for most platforms)

### Issue: Meta tags showing old/cached data
**Solution:**
- Use social media validators to force re-scrape
- Wait 24-48 hours for cache to expire
- For Facebook: use "Fetch new information" button

## Cache Considerations

**Current implementation**: `cache: 'no-store'`
- Always fetches fresh data
- Slower performance
- Always shows latest content

**Future optimization** (optional):
Add ISR (Incremental Static Regeneration):
```javascript
export const revalidate = 60; // Revalidate every 60 seconds
```

## Monitoring

After deployment, monitor:
1. Check Vercel logs for 404 errors on dynamic routes
2. Verify social media crawlers are accessing pages successfully
3. Monitor page load times (SSR adds overhead)

## Rollback Plan

If issues occur:
1. Revert the following files:
   - `/src/app/page-client.js`
   - `/src/app/page.js`
2. Delete dynamic route folders:
   - `/src/app/post/`
   - `/src/app/member/`
   - `/src/app/event/`
3. Redeploy

## Success Criteria

✅ Post links show correct title/image/description in WhatsApp
✅ Member links show profile info in social previews
✅ Direct links open correct content immediately
✅ Hash URLs auto-upgrade to clean routes
✅ No 404 errors for valid content
✅ Navigation works seamlessly
