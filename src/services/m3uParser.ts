import { IPTVChannel } from '../types';

const UNSUPPORTED_STREAM_PATTERNS = [
  'youtube.com',
  'youtu.be',
  'twitch.tv',
  'facebook.com',
  'instagram.com',
];

function isPlayableStreamUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    const normalizedUrl = url.toLowerCase();
    return !UNSUPPORTED_STREAM_PATTERNS.some((pattern) => normalizedUrl.includes(pattern));
  } catch {
    return false;
  }
}

export async function fetchAndParseM3U(url: string): Promise<IPTVChannel[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist: ${response.status}`);
    }
    
    const text = await response.text();
    return parseM3U(text);
  } catch (error) {
    console.error('Error fetching M3U:', error);
    // Return demo channels if fetch fails
    return getDemoChannels();
  }
}

function parseM3U(content: string): IPTVChannel[] {
  const channels: IPTVChannel[] = [];
  
  // Optimized parsing: avoid split for huge files, use indexOf-based scanning
  let pos = 0;
  const len = content.length;
  let currentChannel: Partial<IPTVChannel> | null = null;

  // Pre-compiled regex patterns for speed
  const logoRe = /tvg-logo="([^"]*)"/;
  const groupRe = /group-title="([^"]*)"/;
  const langRe = /tvg-language="([^"]*)"/;
  const countryRe = /tvg-country="([^"]*)"/;
  const nameRe = /,([^,]+)$/;

  while (pos < len) {
    // Find end of line
    let eol = content.indexOf('\n', pos);
    if (eol === -1) eol = len;
    
    // Trim line
    let start = pos;
    let end = eol;
    while (start < end && (content[start] === ' ' || content[start] === '\r' || content[start] === '\t')) start++;
    while (end > start && (content[end - 1] === ' ' || content[end - 1] === '\r' || content[end - 1] === '\t')) end--;
    
    const line = content.substring(start, end);
    pos = eol + 1;

    if (line.length === 0) continue;

    if (line.charCodeAt(0) === 35) { // '#'
      if (line.startsWith('#EXTINF:')) {
        currentChannel = {
          logo: logoRe.exec(line)?.[1] || '',
          group: groupRe.exec(line)?.[1] || 'General',
          language: langRe.exec(line)?.[1] || '',
          country: countryRe.exec(line)?.[1] || '',
          name: nameRe.exec(line)?.[1]?.trim() || 'Unknown Channel',
        };
      }
    } else if (currentChannel?.name) {
      if (isPlayableStreamUrl(line)) {
        channels.push({
          id: generateId(currentChannel.name, line),
          name: currentChannel.name,
          url: line,
          logo: currentChannel.logo,
          group: currentChannel.group,
          language: currentChannel.language,
          country: currentChannel.country,
        });
      }
      currentChannel = null;
    }
  }
  
  return channels.length > 0 ? channels : getDemoChannels();
}

function generateId(name: string, url: string): string {
  const combined = `${name}-${url}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function getDemoChannels(): IPTVChannel[] {
  return [
    {
      id: 'demo1',
      name: 'Big Buck Bunny',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg',
      group: 'Demo',
      language: 'English',
    },
    {
      id: 'demo2',
      name: 'Sintel',
      url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Sintel.jpg/220px-Sintel.jpg',
      group: 'Demo',
      language: 'English',
    },
    {
      id: 'demo3',
      name: 'Tears of Steel',
      url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Tos-poster.png/220px-Tos-poster.png',
      group: 'Demo',
      language: 'English',
    },
  ];
}
