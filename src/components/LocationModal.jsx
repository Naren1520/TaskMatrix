import React, { useState, useRef, useEffect } from 'react';
import { FiMapPin, FiCrosshair } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const LocationModal = ({ isOpen, onClose, task, onSave }) => {
  const existing = task?.locationReminder || {};
  const [enabled, setEnabled] = useState(!!existing.enabled);
  const [lat, setLat] = useState(existing.lat || 28.6139);
  const [lng, setLng] = useState(existing.lng || 77.2090);
  const [radius, setRadius] = useState(existing.radius || 100);
  const [address, setAddress] = useState(existing.address || '');
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapObjRef = useRef(null);

  // Do not early-return before hooks — final render will respect `isOpen`.

  const useCurrent = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude.toFixed(6));
      setLng(pos.coords.longitude.toFixed(6));
      // If map is initialized, update marker and center
      if (markerRef.current) {
        const latNum = parseFloat(pos.coords.latitude);
        const lngNum = parseFloat(pos.coords.longitude);
        markerRef.current.setPosition({ lat: latNum, lng: lngNum });
        if (mapObjRef.current) mapObjRef.current.setCenter({ lat: latNum, lng: lngNum });
      }
    }, (err) => {
      console.error(err);
      alert('Unable to get current location');
    }, { timeout: 10000 });
  };

  // Dynamically load Leaflet (no API key required) and initialize an interactive map picker.
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const ensureLeaflet = () => new Promise((resolve, reject) => {
      if (window.L) return resolve(window.L);
      const existingCss = document.querySelector('link[data-leaflet]');
      if (!existingCss) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.crossOrigin = '';
        link.setAttribute('data-leaflet', '1');
        document.head.appendChild(link);
      }
      const existingScript = document.querySelector('script[data-leaflet]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.L));
        existingScript.addEventListener('error', () => reject(new Error('Leaflet load error')));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.setAttribute('data-leaflet', '1');
      script.onload = () => resolve(window.L);
      script.onerror = () => reject(new Error('Failed to load Leaflet'));
      document.head.appendChild(script);
    });

    ensureLeaflet().then((L) => {
      if (!mounted || !isOpen) return;
      try {
        // clean up previous map if exists
        if (mapObjRef.current && mapObjRef.current.remove) {
          mapObjRef.current.remove();
          mapObjRef.current = null;
          markerRef.current = null;
        }
        const latNum = parseFloat(lat) || 28.6139;
        const lngNum = parseFloat(lng) || 77.2090;
        const map = L.map(mapRef.current).setView([latNum, lngNum], 13);
        mapObjRef.current = map;
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        const marker = L.marker([latNum, lngNum], { draggable: false }).addTo(map);
        markerRef.current = marker;
        map.on('click', (e) => {
          const a = e.latlng.lat;
          const b = e.latlng.lng;
          setLat(a.toFixed(6));
          setLng(b.toFixed(6));
          if (markerRef.current && markerRef.current.setLatLng) markerRef.current.setLatLng([a, b]);
        });
      } catch (err) {
        console.error('Leaflet init failed', err);
      }
    }).catch((err) => {
      console.warn('Leaflet load failed', err);
    });

    return () => { mounted = false; if (mapObjRef.current && mapObjRef.current.remove) { mapObjRef.current.remove(); mapObjRef.current = null; markerRef.current = null; } };
  }, [isOpen, lat, lng]);

  const handleSave = () => {
    const payload = {
      enabled: !!enabled,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      radius: Number(radius) || 100,
      address: address || ''
    };
    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><FiMapPin /> Location Reminder</h3>
          <button onClick={onClose} className="text-gray-600 dark:text-gray-300">Close</button>
        </div>


        {/* Interactive map picker (Leaflet) — no API key required */}
        <div className="w-full h-64 mb-4 rounded border border-gray-300 dark:border-gray-600" ref={mapRef} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
            <input value={lat} onChange={(e)=>setLat(e.target.value)} className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
            <input value={lng} onChange={(e)=>setLng(e.target.value)} className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:text-white text-sm" />
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Radius (meters): {radius}</label>
          <input type="range" min="20" max="1000" step="10" value={radius} onChange={(e)=>setRadius(e.target.value)} className="w-full" />
        </div>

        <div className="mb-3">
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Address (optional)</label>
          <input value={address} onChange={(e)=>setAddress(e.target.value)} className="w-full px-3 py-2 rounded border dark:bg-gray-700 dark:text-white text-sm" />
        </div>

        <div className="flex gap-2 items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={enabled} onChange={(e)=>setEnabled(e.target.checked)} />
              Enable location reminder
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={useCurrent} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded flex items-center gap-2 text-sm"> <FiCrosshair /> Use current</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Save</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LocationModal;
