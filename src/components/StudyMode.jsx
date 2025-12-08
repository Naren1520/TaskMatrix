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
    <div ref={containerRef} className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Study Mode</h2>
          <div className="text-sm text-slate-400">Focus and study tools</div>
        </div>
        <div className="flex items-center gap-3">
          {!running && <button onClick={() => { if (onBack) onBack(); }} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors">Close</button>}
          {running && <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium">Session Running</div>}
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex-1 p-6 overflow-auto bg-gradient-to-b from-slate-800/50 to-slate-900/50">
        {!running && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Timer Card */}
            <div className="bg-slate-800/40 dark:bg-slate-800/60 rounded-xl p-6 flex flex-col border border-slate-700/50 hover:border-slate-600/50 transition-colors shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Study Timer</h3>
              <div className="flex gap-2 mb-4 flex-wrap">
                <button onClick={() => setMinutesInput(25)} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors">25m</button>
                <button onClick={() => setMinutesInput(50)} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors">50m</button>
                <button onClick={() => setMinutesInput(15)} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors">15m</button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <input type="number" min={1} value={minutesInput} onChange={(e) => setMinutesInput(Number(e.target.value || 0))} className="w-24 px-3 py-2 rounded-lg bg-slate-700/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span className="text-slate-300">minutes</span>
              </div>
              <div className="flex gap-3 mt-auto">
                <button onClick={() => handleStart(minutesInput * 60)} className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold transition-all transform hover:scale-105">Start</button>
                <button onClick={() => { if (onBack) onBack(); }} className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors">Cancel</button>
              </div>
            </div>

            {/* PDF Card */}
            <div className="bg-slate-800/40 dark:bg-slate-800/60 rounded-xl p-6 flex flex-col border border-slate-700/50 hover:border-slate-600/50 transition-colors shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Read PDF</h3>
              <input type="file" accept="application/pdf" onChange={(e) => {
                const f = e.target.files && e.target.files[0];
                if (f) {
                  const url = URL.createObjectURL(f);
                  setPdfUrl(url);
                  setPdfName(f.name || 'document');
                  setShowPdf(true);
                }
              }} className="text-sm text-slate-300 mb-3 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-700 file:text-white hover:file:bg-slate-600" />
              {pdfUrl && <div className="text-sm text-slate-400 mb-3 flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full"></span>Loaded: {pdfName || 'document'}</div>}
              <div className="mt-auto">
                <button onClick={() => { if (pdfUrl) setShowPdf(true); }} className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold transition-all transform hover:scale-105">Open Reader</button>
              </div>
            </div>

            {/* YouTube Card */}
            <div className="bg-slate-800/40 dark:bg-slate-800/60 rounded-xl p-6 flex flex-col border border-slate-700/50 hover:border-slate-600/50 transition-colors shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-3">YouTube</h3>
              <div className="flex gap-2 mb-3">
                <input placeholder="Search or paste URL" value={ytQuery} onChange={(e) => setYtQuery(e.target.value)} className="flex-1 px-4 py-2 rounded-lg bg-slate-700/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                <button onClick={handleYouTubeSearch} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium transition-colors">Search</button>
              </div>
              <div className="flex-1 overflow-auto">
                {ytResults.length > 0 && (
                  <div className="grid grid-cols-1 gap-2">
                    {ytResults.map((r) => (
                      <button key={r.id.videoId} onClick={() => selectVideo(r.id.videoId)} className="flex items-center gap-2 p-2 rounded-lg bg-slate-700/40 hover:bg-slate-700/60 w-full text-left transition-colors">
                        <img src={r.snippet.thumbnails.default.url} alt="thumb" className="w-20 h-12 object-cover rounded-md" />
                        <div className="text-sm flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{r.snippet.title}</div>
                          <div className="text-xs text-slate-400 truncate">{r.snippet.channelTitle}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3">
                <button onClick={() => { if (selectedVideoId) setShowVideo(true); }} className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all transform hover:scale-105">Open Video</button>
              </div>
            </div>
          </div>
        )}

        {running && (
          <div className="h-full flex items-center justify-center bg-gradient-to-b from-slate-800/50 to-slate-900/50">
            <div className="flex flex-col items-center gap-8">
              <div className="relative w-96 h-96">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl"></div>
                <div className="absolute inset-0 rounded-full border-2 border-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                  <div className="w-80 h-80 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700/50">
                    <div className="text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{pad(displayMin)}:{pad(displaySec)}</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-300 text-sm mb-2">Time Remaining</div>
                <div className="text-3xl font-semibold text-white">{Math.max(0, Math.ceil((durationSec || 0) / 60))} min</div>
              </div>
              <div>
                <button disabled className="px-8 py-3 rounded-lg bg-slate-700 text-slate-400 opacity-60 cursor-not-allowed font-semibold">Exit (locked)</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals and warnings (same as earlier) */}
      {showPdf && pdfUrl && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-6 z-50">
          <div className="w-[90vw] h-[90vh] bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col border border-slate-700/50">
            <div className="p-4 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50">
              <div className="font-semibold text-white">PDF Reader</div>
              <div className="flex items-center gap-2">
                <a href={pdfUrl} download={pdfName || 'document.pdf'} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors">Download</a>
                <button onClick={() => { setShowPdf(false); }} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors">Close</button>
              </div>
            </div>
            <iframe src={pdfUrl} className="w-full h-full bg-white" title="pdf-reader" />
          </div>
        </div>
      )}

      {showVideo && selectedVideoId && (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-6 z-50">
          <div className="w-[90vw] h-[90vh] bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col border border-slate-700/50">
            <div className="p-4 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50">
              <div className="text-white font-semibold">YouTube Video</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowVideo(false)} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors">Close</button>
              </div>
            </div>
            <div className="w-full h-full flex items-center justify-center bg-black">
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
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none z-40">
          <div className="mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-lg">Stay focused! You left Study Mode.</div>
        </div>
      )}

      {showFsWarning && (
        <div className="absolute top-6 right-6 px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg z-40">Fullscreen exited — attempting to re-enter</div>
      )}

    </div>
  );
};

export default StudyMode;
