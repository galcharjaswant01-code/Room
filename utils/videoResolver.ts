/**
 * Resolves video URLs/paths entered by users into browser-playable static URLs.
 */
export const resolveVideoUrl = (rawUrl?: string): string => {
  if (!rawUrl || rawUrl.trim() === '') {
    return '/room-videos/13394638_1080_1920_30fps.mp4';
  }

  const trimmed = rawUrl.trim();

  // If already web URL or relative path
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }

  // If Windows local file path (e.g. C:\Users\...\12684293_1920_1080_60fps.mp4) or raw filename
  const filename = trimmed.split(/[/\\]/).pop();
  if (filename) {
    return `/room-videos/${filename}`;
  }

  return trimmed;
};
