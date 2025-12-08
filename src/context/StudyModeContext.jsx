import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const StudyModeContext = createContext(null);

export const StudyModeProvider = ({ children }) => {
  const [running, setRunning] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const endTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const [locked, setLocked] = useState(false);
  const [violations, setViolations] = useState(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const start = (seconds) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const now = Date.now();
    endTimeRef.current = now + seconds * 1000;
    setDurationSec(seconds);
    setTimeLeftMs(seconds * 1000);
    setRunning(true);
    setLocked(true);
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, endTimeRef.current - Date.now());
      setTimeLeftMs(left);
      if (left <= 0) {
        // finish
        stop(true);
      }
    }, 250);
  };

  const stop = (finished = false) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
    setLocked(false);
    endTimeRef.current = null;
    if (!finished) {
      setTimeLeftMs(0);
    }
  };

  const addViolation = () => {
    setViolations((v) => v + 1);
  };

  return (
    <StudyModeContext.Provider value={{ running, durationSec, timeLeftMs, locked, violations, start, stop, addViolation }}>
      {children}
    </StudyModeContext.Provider>
  );
};

export const useStudyMode = () => {
  const ctx = useContext(StudyModeContext);
  if (!ctx) throw new Error('useStudyMode must be used within StudyModeProvider');
  return ctx;
};
