-- Add video support to posts table
-- Run this migration with: node scripts/run-migration.js migrations/add_video_support_to_posts.sql

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) DEFAULT 'image',
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Update existing posts to have media_type='image' if they have an image
UPDATE posts
SET media_type = 'image'
WHERE image IS NOT NULL AND media_type IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN posts.media_type IS 'Type of media: image, video, or embed (YouTube/TikTok)';
COMMENT ON COLUMN posts.video_url IS 'URL for video content (YouTube, TikTok, direct video URL, etc.)';
