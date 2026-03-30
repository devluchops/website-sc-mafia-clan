/**
 * Convert video URLs to embeddable format
 * Supports: YouTube, TikTok, and direct video URLs
 */

export function getVideoEmbedUrl(url) {
  if (!url) return null;

  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch && youtubeMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      thumbnail: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`,
    };
  }

  // TikTok
  const tiktokRegex = /tiktok\.com\/@[\w.-]+\/video\/(\d+)|tiktok\.com\/v\/(\d+)|vm\.tiktok\.com\/(\w+)/;
  const tiktokMatch = url.match(tiktokRegex);
  if (tiktokMatch) {
    const videoId = tiktokMatch[1] || tiktokMatch[2] || tiktokMatch[3];
    return {
      type: 'tiktok',
      embedUrl: url, // TikTok embed requires special handling
      originalUrl: url,
    };
  }

  // Direct video URL (mp4, webm, ogg)
  const videoExtRegex = /\.(mp4|webm|ogg)(\?|$)/i;
  if (videoExtRegex.test(url)) {
    return {
      type: 'video',
      embedUrl: url,
    };
  }

  // Default fallback
  return {
    type: 'unknown',
    embedUrl: url,
  };
}

export function isVideoUrl(url) {
  if (!url) return false;
  const videoInfo = getVideoEmbedUrl(url);
  return videoInfo && videoInfo.type !== 'unknown';
}
