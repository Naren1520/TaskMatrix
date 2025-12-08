import { useEffect, useRef } from 'react';
import { useTodoState, useTodoDispatch } from '../context/TodoContext';

// Haversine formula to compute distance in meters
function distanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useGeofenceWatcher({ pollInterval = 15000, notifyCooldownMs = 60 * 60 * 1000 } = {}) {
  const { todos } = useTodoState();
  const { updateTodo } = useTodoDispatch();
  const notifiedRef = useRef({}); // { todoId: timestamp }
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const handlePosition = (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const now = Date.now();
      const toCheck = (todos || []).filter(t => t.locationReminder && t.locationReminder.enabled && t.locationReminder.lat != null && t.locationReminder.lng != null);

      toCheck.forEach(todo => {
        try {
          const { lat: tLat, lng: tLng, radius = 100 } = todo.locationReminder;
          const dist = distanceMeters(lat, lon, parseFloat(tLat), parseFloat(tLng));
          const lastNotified = notifiedRef.current[todo.id] || (todo.locationReminder.lastNotifiedAt ? new Date(todo.locationReminder.lastNotifiedAt).getTime() : 0);
          if (dist <= (radius || 100)) {
            if (now - lastNotified > notifyCooldownMs) {
              // trigger browser notification if permitted
              if (window.Notification && Notification.permission === 'granted') {
                new Notification(`Nearby: ${todo.text}`, { body: todo.locationReminder.address || 'You are near a task location', tag: `task-${todo.id}` });
              }
              // update lastNotifiedAt on the todo to avoid repeats
              updateTodo(todo.id, { locationReminder: { ...(todo.locationReminder || {}), lastNotifiedAt: new Date().toISOString() } });
              notifiedRef.current[todo.id] = now;
            }
          }
        } catch (err) {
          console.error('Geofence check failed', err);
        }
      });
    };

    // Request permission for Notifications if supported
    if (window.Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      try { Notification.requestPermission(); } catch (e) { /* ignore */ }
    }

    // Prefer watchPosition for continuous updates
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, (err) => {
        console.warn('Geolocation watch error', err);
      }, { enableHighAccuracy: false, maximumAge: 5000, timeout: 10000 });
    } catch (e) {
      // fallback to polling
      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(handlePosition, () => {}, { maximumAge: 5000, timeout: 10000 });
      }, pollInterval);
      return () => clearInterval(interval);
    }

    return () => {
      if (watchIdRef.current != null && navigator.geolocation.clearWatch) {
        try { navigator.geolocation.clearWatch(watchIdRef.current); } catch {}
      }
    };
  }, [todos, updateTodo, pollInterval, notifyCooldownMs]);
}

export default useGeofenceWatcher;
