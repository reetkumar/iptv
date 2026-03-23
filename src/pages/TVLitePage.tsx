import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchAndParseM3U } from '../services/m3uParser';
import { IPTVChannel } from '../types';

const M3U_URL = 'https://iptv-org.github.io/iptv/countries/in.m3u';
const PAGE_SIZE = 60;

const TVLitePage: React.FC = () => {
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<IPTVChannel | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    fetchAndParseM3U(M3U_URL)
      .then(chs => { setChannels(chs); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    if (!search) return channels.slice(0, PAGE_SIZE);
    const q = search.toLowerCase();
    return channels.filter(c => c.name.toLowerCase().includes(q) || c.group?.toLowerCase().includes(q)).slice(0, PAGE_SIZE);
  }, [channels, search]);

  const playChannel = useCallback((ch: IPTVChannel) => {
    setPlaying(ch);
  }, []);

  const closePlayer = useCallback(() => {
    setPlaying(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
  }, []);

  // Arrow key navigation
  useEffect(() => {
    const getColumns = () => {
      const w = window.innerWidth;
      if (w < 500) return 2;
      if (w < 768) return 3;
      if (w < 1024) return 4;
      return 5;
    };

    const handler = (e: KeyboardEvent) => {
      if (playing) {
        if (e.key === 'Escape' || e.key === 'Backspace') { closePlayer(); e.preventDefault(); }
        return;
      }

      const count = filtered.length;
      if (!count) return;
      const cols = getColumns();

      switch (e.key) {
        case 'ArrowDown': setFocusIdx(i => Math.min(i + cols, count - 1)); e.preventDefault(); break;
        case 'ArrowUp': setFocusIdx(i => Math.max(i - cols, 0)); e.preventDefault(); break;
        case 'ArrowRight': setFocusIdx(i => Math.min(i + 1, count - 1)); e.preventDefault(); break;
        case 'ArrowLeft': setFocusIdx(i => Math.max(i - 1, 0)); e.preventDefault(); break;
        case 'Enter': playChannel(filtered[focusIdx]); e.preventDefault(); break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [playing, filtered, focusIdx, playChannel, closePlayer]);

  // Auto-scroll focused card into view
  useEffect(() => {
    const card = gridRef.current?.children[focusIdx] as HTMLElement | undefined;
    card?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focusIdx]);

  // HLS setup for player
  useEffect(() => {
    if (!playing || !videoRef.current) return;
    const v = videoRef.current;
    v.src = playing.url;
    v.play().catch(() => {});
    return () => { v.pause(); v.src = ''; };
  }, [playing]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#888', fontFamily: 'system-ui,sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 8 }}>REET TV</div>
          <div>Loading channels...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#888', fontFamily: 'system-ui,sans-serif', textAlign: 'center', padding: 20 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Connection Failed</div>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '10px 24px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e5e5e5', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#111', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #222' }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>
          REET <span style={{ color: '#e11d48' }}>TV</span>
          <span style={{ fontSize: 10, marginLeft: 6, color: '#888', fontWeight: 400 }}>LITE</span>
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => { setSearch(e.target.value); setFocusIdx(0); }}
          style={{ flex: 1, maxWidth: 350, padding: '8px 14px', borderRadius: 20, border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: 14, outline: 'none' }}
        />
        <div style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>{filtered.length} ch</div>
        <a href="/?mode=full" style={{ fontSize: 11, color: '#e11d48', textDecoration: 'none', whiteSpace: 'nowrap' }}>Full Mode -&gt;</a>
      </div>

      {/* Channel Grid */}
      <div
        ref={gridRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))',
          gap: 8,
          padding: '12px 16px',
        }}
      >
        {filtered.map((ch, i) => (
          <button
            key={ch.id}
            onClick={() => playChannel(ch)}
            style={{
              background: i === focusIdx ? '#1e1e1e' : '#1a1a1a',
              border: i === focusIdx ? '2px solid #e11d48' : '2px solid transparent',
              borderRadius: 8,
              padding: '12px 10px',
              cursor: 'pointer',
              textAlign: 'left',
              outline: 'none',
              transition: 'border-color .15s',
              minHeight: 44,
            }}
          >
            <div style={{ fontSize: 9, background: '#e11d48', color: '#fff', display: 'inline-block', padding: '1px 6px', borderRadius: 4, marginBottom: 6, fontWeight: 700 }}>LIVE</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</div>
            <div style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.group}</div>
          </button>
        ))}
      </div>

      {/* Player Overlay */}
      {playing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#000', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: '#111' }}>
            <button onClick={closePlayer} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#333', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', minHeight: 44 }}>&lt;- Back</button>
            <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{playing.name}</div>
          </div>
          <video ref={videoRef} controls autoPlay playsInline style={{ flex: 1, width: '100%', background: '#000' }} />
        </div>
      )}
    </div>
  );
};

export default TVLitePage;
