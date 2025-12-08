import React, { useEffect, useRef, useState } from 'react';
import { useStudyMode } from '../context/StudyModeContext';
import { useFullscreen } from '../hooks/useFullscreen';
import { usePreventNavigation } from '../hooks/usePreventNavigation';

const pad = (n) => String(n).padStart(2, '0');

export const StudyMode = ({ onBack }) => {
  const containerRef = useRef(null);
  const { running, timeLeftMs, start, stop, locked, addViolation, durationSec } = useStudyMode();
  const { enter, exit } = useFullscreen();

  const [minutesInput, setMinutesInput] = useState(25);
  const [showLeftWarning, setShowLeftWarning] = useState(false);
  const [showFsWarning, setShowFsWarning] = useState(false);

  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [showPdf, setShowPdf] = useState(false);

  const [ytQuery, setYtQuery] = useState('');
  const [ytResults, setYtResults] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [showVideo, setShowVideo] = useState(false);

  usePreventNavigation({ active: running, onViolation: () => addViolation() });

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && running) {
        setShowLeftWarning(true);
        addViolation();
      } else {
        setShowLeftWarning(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [running, addViolation]);

  useEffect(() => {
    const onFsChange = () => {
      if (running && !document.fullscreenElement) {
        setShowFsWarning(true);
        addViolation();
        setTimeout(() => {
          if (containerRef.current) enter(containerRef.current).catch(() => {});
        }, 500);
      } else {
        setShowFsWarning(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [running, enter, addViolation]);

  const playFinishSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.1, now + 0.02);
      o.start(now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
      o.stop(now + 1.6);
    } catch (err) {
      const a = new Audio();
      a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
      a.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (running && timeLeftMs <= 0) {
      playFinishSound();
      stop(true);
      try {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      } catch {}
    }
  }, [timeLeftMs, running, stop]);

  const extractYouTubeId = (text) => {
    if (!text) return null;
    try {
      const url = new URL(text);
      if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
      if (url.searchParams.has('v')) return url.searchParams.get('v');
    } catch {}
    const m = text.match(/[?&]v=([\w-]{11})|youtu\.be\/([\w-]{11})/);
    if (m) return m[1] || m[2];
    return null;
  };

  const selectVideo = (id) => {
    setSelectedVideoId(id);
    setShowVideo(true);
  };

  const handleYouTubeSearch = async () => {
    const q = ytQuery.trim();
    if (!q) return;
    const maybeId = extractYouTubeId(q);
    if (maybeId) {
      selectVideo(maybeId);
      return;
    }

    const envKey = import.meta.env.VITE_YT_API_KEY || '';
    if (!envKey) {
      alert('No YouTube API key configured. Paste a YouTube URL to open directly, or set VITE_YT_API_KEY in your env.');
      return;
    }

    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(q)}&key=${envKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setYtResults(data.items || []);
    } catch (err) {
      console.error('YouTube search error', err);
      alert('YouTube search failed. Check API key or network.');
    }
  };

  const handleStart = async (sec) => {
    if (containerRef.current) {
      try {
        await enter(containerRef.current);
      } catch {}
    }
    start(sec);
    try { history.pushState(null, document.title, location.href); } catch {}
  };

  const handleStop = () => {
    if (locked) return;
    stop(false);
    try { exit(); } catch {}
    if (onBack) onBack();
  };

  const secsLeft = Math.max(0, Math.ceil(timeLeftMs / 1000));
  const displayMin = Math.floor(secsLeft / 60);
  const displaySec = secsLeft % 60;

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black text-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-semibold">Study Mode</h2>
          <div className="text-sm text-white/70">Focus and study tools</div>
        </div>
        <div className="flex items-center gap-3">
          {!running && <button onClick={() => { if (onBack) onBack(); }} className="px-3 py-2 rounded bg-white/10">Close</button>}
          {running && <div className="px-3 py-2 rounded bg-red-600 text-white">Session Running</div>}
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex-1 p-6 overflow-auto">
        {!running && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Timer Card */}
            <div className="bg-white/6 rounded-lg p-6 flex flex-col">
              <h3 className="text-lg font-semibold mb-3">Study Timer</h3>
              <div className="flex gap-3 mb-4">
                <button onClick={() => setMinutesInput(25)} className="px-3 py-2 rounded bg-white/10">25m</button>
                <button onClick={() => setMinutesInput(50)} className="px-3 py-2 rounded bg-white/10">50m</button>
                <button onClick={() => setMinutesInput(15)} className="px-3 py-2 rounded bg-white/10">15m</button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <input type="number" min={1} value={minutesInput} onChange={(e) => setMinutesInput(Number(e.target.value || 0))} className="w-28 px-3 py-2 rounded text-black" />
                <span className="text-white/80">minutes</span>
              </div>
              <div className="flex gap-3 mt-auto">
                <button onClick={() => handleStart(minutesInput * 60)} className="px-6 py-3 rounded bg-green-500">Start</button>
                <button onClick={() => { if (onBack) onBack(); }} className="px-6 py-3 rounded bg-white/10">Cancel</button>
              </div>
            </div>

            {/* PDF Card */}
            <div className="bg-white/6 rounded-lg p-6 flex flex-col">
              <h3 className="text-lg font-semibold mb-2">Read PDF</h3>
              <p className="text-sm text-white/70 mb-3">Import a PDF to read in a large viewer.</p>
              <input type="file" accept="application/pdf" onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (f) {
                  const url = URL.createObjectURL(f);
                  setPdfUrl(url);
                  setPdfName(f.name || 'document');
                  setShowPdf(true);
                }
              }} className="text-sm text-white/80 mb-3" />
              {pdfUrl && <div className="text-sm text-white/80 mb-3">Loaded: {pdfName || 'document'}</div>}
              <div className="mt-auto">
                <button onClick={() => { if (pdfUrl) setShowPdf(true); }} className="px-4 py-2 rounded bg-indigo-600">Open Reader</button>
              </div>
            </div>

            {/* YouTube Card */}
            <div className="bg-white/6 rounded-lg p-6 flex flex-col">
              <h3 className="text-lg font-semibold mb-2">YouTube (In-site)</h3>
              <p className="text-sm text-white/70 mb-3">Search or paste a URL to open a video inside Study Mode.</p>
              <div className="w-full text-sm text-white/70 mb-2">YouTube search uses <code className="bg-white/5 px-1 rounded">VITE_YT_API_KEY</code>. Paste a URL to open directly.</div>
              <div className="flex gap-2 mb-3">
                <input placeholder="Search query or paste URL" value={ytQuery} onChange={(e) => setYtQuery(e.target.value)} className="flex-1 px-3 py-2 rounded text-black" />
                <button onClick={handleYouTubeSearch} className="px-3 py-2 rounded bg-purple-600">Search</button>
              </div>
              <div className="flex-1 overflow-auto">
                {ytResults.length > 0 && (
                  <div className="grid grid-cols-1 gap-2">
                    {ytResults.map((r) => (
                      <button key={r.id.videoId} onClick={() => selectVideo(r.id.videoId)} className="flex items-center gap-2 p-2 rounded bg-white/5 w-full text-left">
                        <img src={r.snippet.thumbnails.default.url} alt="thumb" className="w-20 h-12 object-cover rounded-sm" />
                        <div className="text-sm">
                          <div className="font-medium text-white">{r.snippet.title}</div>
                          <div className="text-xs text-white/70">{r.snippet.channelTitle}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3">
                <button onClick={() => { if (selectedVideoId) setShowVideo(true); }} className="px-4 py-2 rounded bg-red-600">Open Video</button>
              </div>
            </div>
          </div>
        )}

        {running && (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-80 h-80 rounded-full bg-white/6 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="text-6xl font-mono">{pad(displayMin)}:{pad(displaySec)}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm">Time Remaining</div>
                <div className="text-sm">{Math.max(0, Math.ceil((durationSec || 0) / 60))} min</div>
              </div>
              <div>
                <button disabled className="px-6 py-3 rounded bg-gray-500 text-white opacity-60">Exit (locked)</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals and warnings (same as earlier) */}
      {showPdf && pdfUrl && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center p-6">
          <div className="w-[90vw] h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-3 flex items-center justify-between bg-gray-50 border-b">
              <div className="font-semibold">PDF Reader</div>
              <div className="flex items-center gap-2">
                <a href={pdfUrl} download={pdfName || 'document.pdf'} className="px-3 py-1 rounded bg-gray-200 text-sm">Download</a>
                <button onClick={() => { setShowPdf(false); }} className="px-3 py-1 rounded bg-gray-200">Close</button>
              </div>
            </div>
            <iframe src={pdfUrl} className="w-full h-full" title="pdf-reader" />
          </div>
        </div>
      )}

      {showVideo && selectedVideoId && (
        <div className="absolute inset-0 bg-black bg-opacity-95 flex items-center justify-center p-6">
          <div className="w-[90vw] h-[90vh] bg-black rounded-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-3 flex items-center justify-between bg-black/70 border-b border-white/10">
              <div className="text-white font-semibold">YouTube</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowVideo(false)} className="px-3 py-1 rounded bg-white/10 text-white">Close</button>
              </div>
            </div>
            <div className="w-full h-full flex items-center justify-center">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideoId}?rel=0&controls=1&modestbranding=1`}
                title="YouTube video"
                className="w-full h-full"
                allow="autoplay; encrypted-media; fullscreen"
              />
            </div>
          </div>
        </div>
      )}

      {showLeftWarning && (
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
          <div className="mt-6 px-4 py-2 rounded-md bg-yellow-600 text-white font-medium">Stay focused! You left Study Mode.</div>
        </div>
      )}

      {showFsWarning && (
        <div className="absolute top-6 right-6 px-3 py-2 rounded-md bg-red-600 text-white font-medium">Fullscreen exited — attempting to re-enter</div>
      )}

    </div>
  );
};

export default StudyMode;
