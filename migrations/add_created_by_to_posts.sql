-- Add created_by field to posts table to track which member created each post
-- Run this migration with: node scripts/run-migration.js migrations/add_created_by_to_posts.sql

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS created_by_member_id INTEGER REFERENCES members(id);

-- Add comment for documentation
COMMENT ON COLUMN posts.created_by_member_id IS 'ID of the member who created this post';
