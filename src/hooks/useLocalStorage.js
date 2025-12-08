// Hook for managing localStorage persistence
// Syncs state with localStorage automatically
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Initialize state from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Update localStorage whenever state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  // Keep state in sync when other tabs/components update localStorage
  useEffect(() => {
    const handler = (e) => {
      if (!e) return;
      try {
        if (e.key === key) {
          const newVal = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setStoredValue(newVal);
        }
      } catch (err) {
        console.error('Error parsing storage event value', err);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key, initialValue]);

  return [storedValue, setStoredValue];
};
