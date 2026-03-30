-- Add video_url support to videos table
-- Run this migration with: node scripts/run-migration.js migrations/add_video_url_to_videos.sql

ALTER TABLE videos
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Migrate existing youtube_id to video_url format
UPDATE videos
SET video_url = 'https://youtube.com/watch?v=' || youtube_id
WHERE youtube_id IS NOT NULL AND youtube_id != '' AND video_url IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN videos.video_url IS 'URL for video content (YouTube, TikTok, direct video URL, etc.). Replaces youtube_id.';
