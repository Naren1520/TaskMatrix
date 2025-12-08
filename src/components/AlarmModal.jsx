// Modal component for setting/editing task alarms
import React, { useState, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { formatAlarmTime } from '../hooks/useAlarmNotifications';

const RINGTONES = [
  { id: 'bell', name: '🔔 Bell', sound: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==' },
  { id: 'chime', name: '🎵 Chime', sound: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==' },
  { id: 'alarm', name: '⏰ Alarm', sound: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==' },
  { id: 'beep', name: '📢 Beep', sound: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==' },
  { id: 'chiming', name: '✨ Chiming', sound: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==' }
];

export const AlarmModal = ({ isOpen, task, onSave, onClose }) => {
  const [alarmTime, setAlarmTime] = useState(task?.alarmTime || '');
  const [ringtone, setRingtone] = useState(task?.ringtone || (task?.customRingtone ? 'custom' : 'bell'));
  const [customRingtone, setCustomRingtone] = useState(task?.customRingtone || null);
  const [library, setLibrary] = useState(() => JSON.parse(localStorage.getItem('ringtones') || '[]'));
  const [selectedLibraryId, setSelectedLibraryId] = useState(task?.ringtoneLibraryId || '');
  const [trimStart, setTrimStart] = useState((task?.customRingtone?.trim?.start) || 0);
  const [trimEnd, setTrimEnd] = useState((task?.customRingtone?.trim?.end) || 0);
  const audioRef = useRef(null);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'ringtones') setLibrary(JSON.parse(localStorage.getItem('ringtones') || '[]'));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleSave = () => {
    const payload = { alarmTime };
    if (selectedLibraryId) {
      payload.ringtoneLibraryId = selectedLibraryId;
      payload.ringtone = 'library';
    } else if (ringtone === 'custom' && customRingtone) {
      payload.ringtone = 'custom';
      // ensure trim values are numeric and default end to 30s if not set
      const trim = customRingtone.trim || {};
      const start = Number(trim.start || 0);
      const end = Number(trim.end || 30);
      payload.customRingtone = { ...customRingtone, trim: { start, end } };
    } else {
      payload.ringtone = ringtone;
    }
    onSave(payload);
    onClose();
  };

  const handlePlaySound = (sourceData, trim) => {
    try {
      const src = sourceData;
      if (!src) return;
      if (!audioRef.current) audioRef.current = document.createElement('audio');
      const audio = audioRef.current;
      audio.pause();
      audio.src = src;
      audio.currentTime = (trim && trim.start) ? Number(trim.start) : 0;
      const playPromise = audio.play();
      if (playPromise && playPromise.catch) playPromise.catch(()=>{});
      if (trim && trim.end) {
        const duration = (Number(trim.end) - (trim.start || 0)) * 1000;
        if (!isNaN(duration) && duration > 0) setTimeout(()=>audio.pause(), duration);
      }
    } catch (err) {
      console.error('Audio playback failed', err);
    }
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      // default trim end to 30s so uploaded songs can be used as short alarms
      const payload = { data, name: file.name, type: file.type, trim: { start: 0, end: 30 } };
      setCustomRingtone(payload);
      setTrimStart(0);
      setTrimEnd(30);
      setRingtone('custom');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveToLibrary = () => {
    if (!customRingtone || !customRingtone.data) return alert('Upload a ringtone first');
    const list = JSON.parse(localStorage.getItem('ringtones') || '[]');
    const id = 'r_' + Math.random().toString(36).substr(2, 9);
    const entry = { id, name: customRingtone.name || `tone-${id}`, data: customRingtone.data, type: customRingtone.type, trim: customRingtone.trim || { start: 0, end: 0 } };
    list.unshift(entry);
    localStorage.setItem('ringtones', JSON.stringify(list));
    setLibrary(list);
    setSelectedLibraryId(id);
    alert('Ringtone saved to library');
  };

  const handleUseLibrary = () => {
    if (!selectedLibraryId) return alert('Select a ringtone from the library');
    const entry = library.find(r => r.id === selectedLibraryId);
    if (!entry) return alert('Selected ringtone not found');
    setCustomRingtone({ data: entry.data, name: entry.name, type: entry.type, trim: entry.trim || {} });
    setRingtone('custom');
  };

  const handleRemoveAlarm = () => {
    onSave(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Set Alarm for: {task?.text}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><FiX size={24} /></button>
        </div>

        {task?.alarmTime && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Current Alarm: <span className="font-semibold">{formatAlarmTime(task.alarmTime)}</span></p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Date and Time</label>
          <input type="datetime-local" value={alarmTime} onChange={(e)=>setAlarmTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Ringtone</label>
          <div className="space-y-2">
            {RINGTONES.map(t => (
              <label key={t.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <input type="radio" name="ringtone" value={t.id} checked={ringtone===t.id} onChange={(e)=>setRingtone(e.target.value)} />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.name}</span>
                <button type="button" onClick={()=>handlePlaySound(t.sound)} className="ml-auto px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded">Play</button>
              </label>
            ))}

            <div className="p-2 border rounded">
              <div className="flex items-center gap-2">
                <input type="radio" name="ringtone" value="custom" checked={ringtone==='custom'} onChange={()=>setRingtone('custom')} />
                <span className="text-sm">🎶 Custom upload</span>
                <input type="file" accept="audio/*" onChange={(e)=>handleFileUpload(e.target.files?.[0])} className="ml-2 text-xs" />
                <button type="button" onClick={()=>handlePlaySound(customRingtone?.data, customRingtone?.trim)} className="ml-auto px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded">Play</button>
              </div>
              {customRingtone && (
                <div className="mt-2 pl-8 space-y-2">
                  <div className="text-xs text-gray-600 dark:text-gray-300">Uploaded: {customRingtone.name}</div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Start (s)</label>
                    <input type="number" min="0" value={trimStart} onChange={(e)=>setTrimStart(Number(e.target.value))} className="w-20 px-2 py-1 text-xs rounded border" />
                    <label className="text-xs">End (s)</label>
                    <input type="number" min="0" value={trimEnd} onChange={(e)=>setTrimEnd(Number(e.target.value))} className="w-20 px-2 py-1 text-xs rounded border" />
                    <button className="px-2 py-1 text-xs bg-green-500 text-white rounded" onClick={()=>{
                      setCustomRingtone(prev=> ({ ...prev, trim: { start: Number(trimStart||0), end: Number(trimEnd||30) }}));
                      alert('Trim applied to custom ringtone');
                    }}>Apply</button>
                    <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded" onClick={handleSaveToLibrary}>Save to library</button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ringtones Library</label>
              <div className="flex gap-2 items-center">
                <select value={selectedLibraryId} onChange={(e)=>setSelectedLibraryId(e.target.value)} className="flex-1 px-3 py-2 text-sm rounded border">
                  <option value="">-- Select --</option>
                  {library.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
                </select>
                <button className="px-3 py-2 bg-gray-200 rounded" onClick={handleUseLibrary}>Use</button>
                <button className="px-3 py-2 bg-red-500 text-white rounded" onClick={()=>{
                  if (!selectedLibraryId) return alert('Select one');
                  if (!confirm('Delete ringtone from library?')) return;
                  const next = library.filter(r=>r.id!==selectedLibraryId);
                  localStorage.setItem('ringtones', JSON.stringify(next));
                  setLibrary(next);
                  setSelectedLibraryId('');
                }}>Delete</button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={!alarmTime} className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold">Set Alarm</motion.button>
          {task?.alarmTime && (<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleRemoveAlarm} className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">Remove</motion.button>)}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-semibold">Cancel</motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AlarmModal;
