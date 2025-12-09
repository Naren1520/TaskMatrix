import React, { useEffect, useRef, useState } from 'react';
import { useStudyMode } from '../context/StudyModeContext';
import { useFullscreen } from '../hooks/useFullscreen';
import { usePreventNavigation } from '../hooks/usePreventNavigation';
import { FiBook, FiYoutube, FiClock, FiX } from 'react-icons/fi';

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

  const isDark = document.documentElement.classList.contains('dark');

  const bgClass = isDark ? 'bg-slate-950' : 'bg-white';
  const cardClass = isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const textClass = isDark ? 'text-slate-100' : 'text-slate-900';
  const mutedClass = isDark ? 'text-slate-400' : 'text-slate-600';
  const inputClass = isDark 
    ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500' 
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500';
  const hoverClass = isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100';

  return (
    <div ref={containerRef} className={`fixed inset-0 ${bgClass} ${textClass} z-50 flex flex-col`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} bg-gradient-to-r ${isDark ? 'from-slate-900 to-slate-800' : 'from-slate-50 to-white'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <FiClock className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>Study Mode</h2>
            <p className={`text-xs ${mutedClass}`}>Focus and minimize distractions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!running && (
            <button
              onClick={() => { if (onBack) onBack(); }}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
          {running && (
            <div className={`px-4 py-2 rounded-lg font-medium text-sm ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'}`}>
              ● Session Active
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 p-8 overflow-auto ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
        {!running && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Timer Card */}
              <div className={`${cardClass} rounded-xl p-6 flex flex-col border transition-colors`}>
                <div className="flex items-center gap-2 mb-6">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                    <FiClock className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <h3 className="text-lg font-semibold">Study Timer</h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={`text-xs font-semibold ${mutedClass} mb-3 block uppercase tracking-wide`}>Quick Presets</label>
                    <div className="flex gap-2 flex-wrap">
                      {[25, 50, 15].map((min) => (
                        <button
                          key={min}
                          onClick={() => setMinutesInput(min)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            minutesInput === min
                              ? isDark
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-blue-500 text-white shadow-lg'
                              : isDark
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {min}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`text-xs font-semibold ${mutedClass} mb-2 block uppercase tracking-wide`}>Custom Duration</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={minutesInput}
                        onChange={(e) => setMinutesInput(Number(e.target.value || 0))}
                        className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
                        placeholder="Minutes"
                      />
                      <span className={`text-sm font-medium ${mutedClass}`}>min</span>
                    </div>
                  </div>

                  <div className={`flex gap-3 mt-6 pt-5 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <button
                      onClick={() => handleStart(minutesInput * 60)}
                      className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                        isDark
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                          : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                      }`}
                    >
                      Start Study
                    </button>
                    <button
                      onClick={() => { if (onBack) onBack(); }}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* PDF Card */}
              <div className={`${cardClass} rounded-xl p-6 flex flex-col border transition-colors`}>
                <div className="flex items-center gap-2 mb-6">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <FiBook className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <h3 className="text-lg font-semibold">Read PDF</h3>
                </div>

                {!pdfUrl ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-8">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <FiBook className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${mutedClass}`}>Upload a PDF file</p>
                      <p className={`text-xs ${mutedClass}`}>to read during study session</p>
                    </div>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const f = e.target.files && e.target.files[0];
                        if (f) {
                          const url = URL.createObjectURL(f);
                          setPdfUrl(url);
                          setPdfName(f.name || 'document');
                        }
                      }}
                      className="hidden"
                      id="pdf-input"
                    />
                    <label
                      htmlFor="pdf-input"
                      className={`cursor-pointer px-5 py-2 rounded-lg font-semibold transition-all ${
                        isDark
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                          : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg'
                      }`}
                    >
                      Choose PDF
                    </label>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between">
                    <div className={`px-4 py-3 rounded-lg border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} mb-4`}>
                      <p className={`text-xs ${mutedClass} mb-1 font-semibold`}>LOADED FILE</p>
                      <p className="font-medium truncate">{pdfName}</p>
                    </div>
                    <button
                      onClick={() => setShowPdf(true)}
                      className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                        isDark
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                          : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg'
                      }`}
                    >
                      Open Reader
                    </button>
                  </div>
                )}
              </div>

              {/* YouTube Card */}
              <div className={`${cardClass} rounded-xl p-6 flex flex-col border transition-colors`}>
                <div className="flex items-center gap-2 mb-6">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                    <FiYoutube className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <h3 className="text-lg font-semibold">YouTube</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      placeholder="Search or paste URL"
                      value={ytQuery}
                      onChange={(e) => setYtQuery(e.target.value)}
                      className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 ${inputClass}`}
                    />
                    <button
                      onClick={handleYouTubeSearch}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        isDark
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      }`}
                    >
                      Search
                    </button>
                  </div>

                  <div className={`flex-1 overflow-auto max-h-48 border rounded-lg p-3 ${isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                    {ytResults.length > 0 ? (
                      <div className="space-y-2">
                        {ytResults.map((r) => (
                          <button
                            key={r.id.videoId}
                            onClick={() => selectVideo(r.id.videoId)}
                            className={`w-full flex gap-2 p-2 rounded-lg transition-colors text-left ${hoverClass}`}
                          >
                            <img src={r.snippet.thumbnails.default.url} alt="thumb" className="w-14 h-10 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{r.snippet.title}</p>
                              <p className={`text-xs ${mutedClass} truncate`}>{r.snippet.channelTitle}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-xs text-center ${mutedClass}`}>Search for videos or paste a URL</p>
                    )}
                  </div>

                  <button
                    onClick={() => { if (selectedVideoId) setShowVideo(true); }}
                    disabled={!selectedVideoId}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                      selectedVideoId
                        ? isDark
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                          : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                        : isDark
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedVideoId ? 'Open Video' : 'Select Video First'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {running && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Timer Column */}
              <div className="flex flex-col items-center justify-center">
                <div className={`${cardClass} rounded-2xl p-8 flex flex-col items-center justify-center border`}>
                  <div className="text-5xl font-bold font-mono mb-4">{pad(displayMin)}:{pad(displaySec)}</div>
                  <p className={`text-sm font-semibold ${mutedClass} uppercase tracking-wide`}>Study Time</p>
                  <div className={`mt-6 px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                    {Math.max(0, Math.ceil((durationSec || 0) / 60))} minutes remaining
                  </div>
                </div>
              </div>

              {/* PDF Column */}
              <div className={`${cardClass} rounded-xl p-6 flex flex-col border transition-colors`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                    <FiBook className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                  <h3 className="font-semibold">Read PDF</h3>
                </div>

                {!pdfUrl ? (
                  <>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const f = e.target.files && e.target.files[0];
                        if (f) {
                          const url = URL.createObjectURL(f);
                          setPdfUrl(url);
                          setPdfName(f.name || 'document');
                        }
                      }}
                      className="hidden"
                      id="pdf-input-running"
                    />
                    <label
                      htmlFor="pdf-input-running"
                      className={`cursor-pointer flex-1 flex flex-col items-center justify-center px-4 py-6 rounded-lg border-2 border-dashed transition-colors ${
                        isDark
                          ? 'border-slate-700 hover:border-purple-500 hover:bg-purple-500/10'
                          : 'border-slate-300 hover:border-purple-500 hover:bg-purple-50'
                      }`}
                    >
                      <FiBook className={`w-8 h-8 mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                      <p className={`text-sm font-medium ${mutedClass}`}>Upload PDF</p>
                    </label>
                  </>
                ) : (
                  <>
                    <div className={`px-3 py-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'} mb-3`}>
                      <p className={`text-xs ${mutedClass} mb-1 font-semibold`}>LOADED</p>
                      <p className="text-sm font-medium truncate">{pdfName}</p>
                    </div>
                    <button
                      onClick={() => setShowPdf(true)}
                      className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
                        isDark
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-purple-500 hover:bg-purple-600 text-white'
                      }`}
                    >
                      Open Reader
                    </button>
                  </>
                )}
              </div>

              {/* YouTube Column */}
              <div className={`${cardClass} rounded-xl p-6 flex flex-col border transition-colors`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                    <FiYoutube className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <h3 className="font-semibold">YouTube</h3>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    placeholder="Search or paste URL"
                    value={ytQuery}
                    onChange={(e) => setYtQuery(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-red-500 ${inputClass}`}
                  />
                  <button
                    onClick={handleYouTubeSearch}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      isDark
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    Search
                  </button>
                </div>

                <div className={`flex-1 overflow-auto border rounded-lg p-2 mb-3 ${isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                  {ytResults.length > 0 ? (
                    <div className="space-y-1">
                      {ytResults.map((r) => (
                        <button
                          key={r.id.videoId}
                          onClick={() => selectVideo(r.id.videoId)}
                          className={`w-full flex gap-2 p-1 rounded transition-colors text-left text-xs ${hoverClass}`}
                        >
                          <img src={r.snippet.thumbnails.default.url} alt="thumb" className="w-12 h-8 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{r.snippet.title}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-xs text-center ${mutedClass}`}>Search videos</p>
                  )}
                  {selectedVideoId && (
                    <div className={`px-2 py-1 rounded text-xs font-medium text-center mt-2 ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                      ✓ Selected
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { if (selectedVideoId) setShowVideo(true); }}
                  disabled={!selectedVideoId}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                    selectedVideoId
                      ? isDark
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                      : isDark
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Play Video
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PDF Modal */}
      {showPdf && pdfUrl && (
        <div className={`absolute inset-0 flex items-center justify-center p-4 z-50 ${isDark ? 'bg-black/70' : 'bg-black/50'}`}>
          <div className={`w-[95vw] h-[95vh] ${cardClass} rounded-xl overflow-hidden shadow-2xl flex flex-col border max-w-6xl`}>
            <div className={`p-4 flex items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
              <h3 className="font-semibold flex items-center gap-2 truncate">
                <FiBook className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                <span className="truncate">{pdfName}</span>
              </h3>
              <div className="flex gap-2">
                <a
                  href={pdfUrl}
                  download={pdfName || 'document.pdf'}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  Download
                </a>
                <button
                  onClick={() => setShowPdf(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
            <iframe src={pdfUrl} className="w-full h-full bg-white" title="pdf-reader" />
          </div>
        </div>
      )}

      {/* YouTube Modal */}
      {showVideo && selectedVideoId && (
        <div className={`absolute inset-0 flex items-center justify-center p-4 z-50 ${isDark ? 'bg-black/70' : 'bg-black/50'}`}>
          <div className={`w-[95vw] h-[95vh] ${cardClass} rounded-xl overflow-hidden shadow-2xl flex flex-col border max-w-6xl`}>
            <div className={`p-4 flex items-center justify-between border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
              <h3 className="font-semibold flex items-center gap-2">
                <FiYoutube className={isDark ? 'text-red-400' : 'text-red-600'} />
                Video
              </h3>
              <button
                onClick={() => setShowVideo(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                Close
              </button>
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

      {/* Warnings */}
      {showLeftWarning && (
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none z-40 pt-8">
          <div className={`px-6 py-3 rounded-lg font-semibold shadow-lg animate-pulse ${isDark ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-900'}`}>
            ⚠️ Stay focused! You left Study Mode
          </div>
        </div>
      )}

      {showFsWarning && (
        <div className={`absolute top-6 right-6 px-6 py-3 rounded-lg font-semibold shadow-lg animate-pulse z-40 ${isDark ? 'bg-red-500 text-white' : 'bg-red-100 text-red-900'}`}>
          ⚠️ Fullscreen exited
        </div>
      )}
    </div>
  );
};

export default StudyMode;
