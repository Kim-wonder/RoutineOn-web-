// F-02: 유튜브 URL에서 videoId 추출
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// F-03: 유튜브 영상 메타 정보 조회 (oEmbed)
export async function fetchVideoMetadata(videoId: string): Promise<{
  title: string;
  channelName: string;
  thumbnailUrl: string;
} | null> {
  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oEmbedUrl);
    
    if (!response.ok) throw new Error('Video not found');
    
    const data = await response.json();
    return {
      title: data.title,
      channelName: data.author_name,
      thumbnailUrl: data.thumbnail_url,
    };
  } catch (error) {
    console.error('Failed to fetch video metadata:', error);
    return null;
  }
}
