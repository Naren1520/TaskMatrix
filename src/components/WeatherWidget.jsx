import React, { useState, useEffect, useCallback } from 'react';
import { FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { getWeatherByCity, getWeatherAlerts, getWeatherIconUrl } from '../utils/weatherService';

export const WeatherWidget = ({ city = 'London', onWeatherChange }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [cityLocal, setCityLocal] = useState(() => {
    try {
      return localStorage.getItem('weather_city') || city;
    } catch (e) {
      return city;
    }
  });

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeatherByCity(cityLocal);
      console.debug('[WeatherWidget] fetchWeather for', cityLocal, 'result:', data);
      if (data) {
        setWeather(data);
        const weatherAlerts = getWeatherAlerts(data);
        setAlerts(weatherAlerts);
        if (onWeatherChange) {
          onWeatherChange(data);
        }
      }
      else {
        setWeather(null);
        setError(`No weather data returned for "${cityLocal}"`);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      setError(error?.message || String(error));
    } finally {
      setLoading(false);
    }
  }, [cityLocal, onWeatherChange]);

  useEffect(() => {
    // store selected city
    try {
      if (cityLocal) localStorage.setItem('weather_city', cityLocal);
    } catch (e) {
      // ignore storage errors
    }
    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  if (!weather) {
    return (
      <div
        className="p-4 bg-gradient-to-r from-blue-400 to-blue-600 dark:from-gray-700 dark:to-gray-900 rounded-lg text-white"
        onClick={(e) => {
          if (e.target.closest && e.target.closest('button')) return;
          if (loading) return;
          const place = window.prompt('Enter city or place for weather', cityLocal || '');
          if (place && place.trim()) setCityLocal(place.trim());
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            if (loading) return;
            const place = window.prompt('Enter city or place for weather', cityLocal || '');
            if (place && place.trim()) setCityLocal(place.trim());
          }
        }}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm">{loading ? 'Loading weather...' : (error ? `Error: ${error}` : 'No weather data')}</p>
          <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
        </div>
        {!loading && !error && (
          <div className="mt-2 text-xs text-blue-100">Click the widget to enter a city.</div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-400 to-blue-600 dark:from-gray-700 dark:to-gray-900 rounded-lg text-white p-4 shadow-lg"
      onClick={async (e) => {
        // Prevent clicks on buttons inside from triggering the prompt
        if (e.target.closest('button')) return;
        const place = window.prompt('Enter city or place for weather', cityLocal || '');
        if (place && place.trim()) {
          setCityLocal(place.trim());
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const place = window.prompt('Enter city or place for weather', cityLocal || '');
          if (place && place.trim()) setCityLocal(place.trim());
        }
      }}
    >
      {/* Main Weather Display */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiMapPin size={16} />
            <h3 className="font-semibold">{weather.city || 'Weather'}</h3>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={getWeatherIconUrl(weather.icon)}
              alt={weather.condition}
              className="w-16 h-16"
            />
            <div>
              <div className="text-4xl font-bold">{Math.round(weather.temp)}°C</div>
              <p className="text-sm text-blue-100">{weather.description}</p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="p-2 hover:bg-blue-500/30 rounded-lg transition-colors"
          title="Refresh weather"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} size={18} />
        </button>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs bg-blue-500/20 p-3 rounded">
        <div>
          <p className="text-blue-100">Feels Like</p>
          <p className="font-semibold">{Math.round(weather.feelsLike)}°</p>
        </div>
        <div>
          <p className="text-blue-100">Humidity</p>
          <p className="font-semibold">{weather.humidity}%</p>
        </div>
        <div>
          <p className="text-blue-100">Wind</p>
          <p className="font-semibold">{Math.round(weather.windSpeed)} m/s</p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3"
        >
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="w-full flex items-center justify-between bg-red-500/20 hover:bg-red-500/30 p-2 rounded text-xs font-semibold transition-colors"
          >
            <span>⚠️ {alerts.length} Alert{alerts.length > 1 ? 's' : ''}</span>
            <span>{showAlerts ? '▼' : '▶'}</span>
          </button>
          {showAlerts && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-2 space-y-2 max-h-40 overflow-y-auto"
            >
              {alerts.map((alert, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-2 rounded text-xs ${
                    alert.level === 'danger'
                      ? 'bg-red-600/20 border border-red-400'
                      : alert.level === 'warning'
                      ? 'bg-orange-600/20 border border-orange-400'
                      : 'bg-blue-600/20 border border-blue-400'
                  }`}
                >
                  <p className="font-semibold">{alert.message}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Task Suitability Indicator */}
      <div className="text-xs">
        <p className="text-blue-100 mb-1">Outdoor Task Suitability:</p>
        <div className="flex gap-1">
          {weather.temp > 35 && (
            <span className="px-2 py-1 bg-red-500/40 rounded text-red-100">🔥 Too Hot</span>
          )}
          {weather.precipitation > 0 && (
            <span className="px-2 py-1 bg-blue-500/40 rounded text-blue-100">🌧️ Rainy</span>
          )}
          {weather.windSpeed > 25 && (
            <span className="px-2 py-1 bg-cyan-500/40 rounded text-cyan-100">💨 Windy</span>
          )}
          {!weather.precipitation && weather.temp > 15 && weather.temp < 28 && weather.windSpeed < 15 && (
            <span className="px-2 py-1 bg-green-500/40 rounded text-green-100">✅ Great!</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
