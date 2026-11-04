/**
 * Resolves video URLs/paths entered by users into browser-playable static URLs.
 */
export const resolveVideoUrl = (rawUrl?: string): string => {
  if (!rawUrl || rawUrl.trim() === '') {
    return '/room-videos/12684293_1920_1080_60fps.mp4';
  }

  let trimmed = rawUrl.trim();

  // Normalize Windows backslashes
  trimmed = trimmed.replace(/\\/g, '/');

  // Normalize folder paths with spaces or url encodings
  trimmed = trimmed.replace(/room%20videos\//gi, 'room-videos/');
  trimmed = trimmed.replace(/room videos\//gi, 'room-videos/');
  trimmed = trimmed.replace(/room%20images\//gi, 'room-images/');
  trimmed = trimmed.replace(/room images\//gi, 'room-images/');

  // If already web URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // If relative path without leading slash
  if (trimmed.startsWith('room-videos/') || trimmed.startsWith('room-images/')) {
    return `/${trimmed}`;
  }

  // If already relative with leading slash
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // If raw filename (e.g. 12684293_1920_1080_60fps.mp4 or room-video-1.mp4)
  const filename = trimmed.split('/').pop();
  if (filename) {
    return `/room-videos/${filename}`;
  }

  return trimmed;
};
