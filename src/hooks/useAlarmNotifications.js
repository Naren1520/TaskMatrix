// Custom hook for managing alarm notifications
// Checks every minute if any task alarm has triggered
import { useEffect, useRef } from 'react';

export const useAlarmNotifications = (todos, onAlarmTrigger) => {
  const checkedAlarmsRef = useRef(new Set());

  useEffect(() => {
    // Set up interval to check alarms every minute
    const alarmInterval = setInterval(() => {
      const now = new Date();

      todos.forEach((todo) => {
        if (todo.alarmTime) {
          const alarmTime = new Date(todo.alarmTime);
          
          // Check if alarm time has arrived and we haven't already triggered it
          if (now >= alarmTime && !checkedAlarmsRef.current.has(todo.id)) {
            checkedAlarmsRef.current.add(todo.id);
            onAlarmTrigger(todo);
          }
        }
      });
    }, 60000); // Check every minute (60000ms)

    return () => clearInterval(alarmInterval);
  }, [todos, onAlarmTrigger]);

  // Listen for alarm changes so we can reset checked alarms
  useEffect(() => {
    const handler = (e) => {
      try {
        const id = e?.detail?.id;
        if (id) checkedAlarmsRef.current.delete(id);
      } catch {
        // ignore
      }
    };
    window.addEventListener('todo:alarmChanged', handler);
    return () => window.removeEventListener('todo:alarmChanged', handler);
  }, []);

  // Function to reset alarm check for a specific todo
  const resetAlarmCheck = (todoId) => {
    checkedAlarmsRef.current.delete(todoId);
  };

  return { resetAlarmCheck };
};

// Function to play a notification sound
export const playNotificationSound = (volume = 0.3) => {
  // Create an audio context for a simple beep sound with configurable volume
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Set frequency and duration
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    const vol = Math.max(0, Math.min(1, Number(volume) || 0.3));
    gainNode.gain.setValueAtTime(vol * 0.6, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Could not play notification sound:', error);
  }
};

// Format alarm time for display
export const formatAlarmTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  // Respect user setting for 12/24-hour format stored in appSettings
  try {
    const raw = window.localStorage.getItem('appSettings');
    const appSettings = raw ? JSON.parse(raw) : {};
    const timeFormat = appSettings?.timeFormat || '24';
    const hour12 = timeFormat === '12';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12,
    });
  } catch (err) {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

// Check if alarm time is in the past
export const isAlarmPast = (isoString) => {
  if (!isoString) return false;
  const alarmTime = new Date(isoString);
  return new Date() > alarmTime;
};
