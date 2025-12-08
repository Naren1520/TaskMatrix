// Weather Service using OpenWeatherMap API
import axios from 'axios';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = import.meta.env.VITE_WEATHER_API_URL;

// Cache weather data for 30 minutes
const weatherCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000;

/**
 * Get current weather by coordinates
 */
export const getWeatherByCoords = async (latitude, longitude) => {
  try {
    const cacheKey = `${latitude},${longitude}`;
    const cached = weatherCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const response = await axios.get(
      `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );

    const data = {
      temp: response.data.main.temp,
      feelsLike: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      condition: response.data.weather[0].main,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      cloudiness: response.data.clouds.all,
      visibility: response.data.visibility / 1000, // convert to km
      precipitation: response.data.rain?.['1h'] || 0,
      timestamp: Date.now(),
    };

    weatherCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};

/**
 * Get weather by city name
 */
export const getWeatherByCity = async (cityName) => {
  try {
    const cacheKey = `city_${cityName}`;
    const cached = weatherCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const response = await axios.get(
      `${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`
    );

    const data = {
      temp: response.data.main.temp,
      feelsLike: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      condition: response.data.weather[0].main,
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      cloudiness: response.data.clouds.all,
      visibility: response.data.visibility / 1000,
      precipitation: response.data.rain?.['1h'] || 0,
      city: response.data.name,
      country: response.data.sys.country,
      timestamp: Date.now(),
    };

    weatherCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error fetching weather by city:', error);
    return null;
  }
};

/**
 * Get weather forecast for next 5 days
 */
export const getWeatherForecast = async (latitude, longitude) => {
  try {
    const cacheKey = `forecast_${latitude},${longitude}`;
    const cached = weatherCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    const response = await axios.get(
      `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );

    const forecast = response.data.list.map(item => ({
      datetime: new Date(item.dt * 1000),
      temp: item.main.temp,
      humidity: item.main.humidity,
      condition: item.weather[0].main,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      precipitation: item.rain?.['3h'] || 0,
      windSpeed: item.wind.speed,
    }));

    const data = {
      forecast,
      city: response.data.city.name,
      country: response.data.city.country,
      timestamp: Date.now(),
    };

    weatherCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return null;
  }
};

/**
 * Check if weather is suitable for outdoor task
 */
export const isWeatherSuitableForOutdoor = (weather, taskType = 'general') => {
  if (!weather) return false;

  const { condition, precipitation, windSpeed, temp } = weather;

  // Define suitable conditions by task type
  const suitabilityRules = {
    sports: {
      unsuitable: ['Rain', 'Thunderstorm', 'Snow', 'Sleet'],
      maxWind: 20,
      tempRange: [5, 35],
    },
    running: {
      unsuitable: ['Rain', 'Thunderstorm', 'Snow'],
      maxWind: 25,
      tempRange: [5, 32],
    },
    cycling: {
      unsuitable: ['Rain', 'Thunderstorm', 'Snow'],
      maxWind: 20,
      tempRange: [0, 35],
    },
    hiking: {
      unsuitable: ['Thunderstorm', 'Snow', 'Fog'],
      maxWind: 30,
      tempRange: [0, 35],
    },
    general: {
      unsuitable: ['Thunderstorm', 'Snow'],
      maxWind: 40,
      tempRange: [-10, 45],
    },
  };

  const rules = suitabilityRules[taskType] || suitabilityRules.general;

  // Check condition
  if (rules.unsuitable.some(c => condition.includes(c))) {
    return false;
  }

  // Check wind speed
  if (windSpeed > rules.maxWind) {
    return false;
  }

  // Check temperature
  if (temp < rules.tempRange[0] || temp > rules.tempRange[1]) {
    return false;
  }

  // Check precipitation
  if (precipitation > 0.5 && taskType !== 'general') {
    return false;
  }

  return true;
};

/**
 * Get weather alerts/warnings
 */
export const getWeatherAlerts = (weather) => {
  const alerts = [];

  if (!weather) return alerts;

  const { condition, temp, windSpeed, humidity } = weather;

  // Temperature alerts
  if (temp > 35) alerts.push({ level: 'warning', message: '🔥 Heat Alert: Very hot weather', icon: '🔥' });
  if (temp < 0) alerts.push({ level: 'warning', message: '❄️ Frost Alert: Below freezing', icon: '❄️' });

  // Weather condition alerts
  if (condition.includes('Rain')) alerts.push({ level: 'info', message: '🌧️ Rainy Weather: Reschedule outdoor tasks', icon: '🌧️' });
  if (condition.includes('Thunderstorm')) alerts.push({ level: 'danger', message: '⛈️ Thunderstorm Warning: Stay indoors', icon: '⛈️' });
  if (condition.includes('Snow')) alerts.push({ level: 'warning', message: '❄️ Snow Warning: Travel may be difficult', icon: '❄️' });
  if (condition.includes('Fog')) alerts.push({ level: 'info', message: '🌫️ Fog Alert: Visibility limited', icon: '🌫️' });

  // Wind alerts
  if (windSpeed > 25) alerts.push({ level: 'warning', message: '💨 High Wind: Strong gusts expected', icon: '💨' });

  // Humidity alerts
  if (humidity > 80) alerts.push({ level: 'info', message: '💧 High Humidity: May feel sticky', icon: '💧' });

  return alerts;
};

/**
 * Suggest tasks based on weather
 */
export const suggestTasksByWeather = (weather) => {
  const suggestions = [];

  if (!weather) return suggestions;

  const { condition, temp, precipitation, windSpeed } = weather;

  // Indoor suggestions
  if (condition.includes('Rain') || precipitation > 0) {
    suggestions.push({
      category: 'Indoor',
      tasks: ['Read a book', 'Work on indoor hobbies', 'Organize your space', 'Write notes', 'Watch educational videos'],
      reason: 'Perfect rainy day to stay indoors',
    });
  }

  // Outdoor suggestions
  if (condition === 'Clear' || condition === 'Clouds') {
    if (windSpeed < 15 && temp > 15 && temp < 28) {
      suggestions.push({
        category: 'Outdoor',
        tasks: ['Go for a walk', 'Outdoor exercise', 'Gardening', 'Explore nearby places'],
        reason: 'Beautiful weather for outdoor activities',
      });
    }
  }

  // Hot weather suggestions
  if (temp > 28) {
    suggestions.push({
      category: 'Hot Weather',
      tasks: ['Stay hydrated', 'Use sunscreen', 'Take a cold shower', 'Relax in shade', 'Drink water regularly'],
      reason: 'Hot weather requires extra care',
    });
  }

  // Cold weather suggestions
  if (temp < 5) {
    suggestions.push({
      category: 'Cold Weather',
      tasks: ['Dress warmly', 'Stay indoors', 'Drink warm beverages', 'Exercise indoors', 'Warm up gradually'],
      reason: 'Cold weather requires preparation',
    });
  }

  return suggestions;
};

/**
 * Get weather icon URL
 */
export const getWeatherIconUrl = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};
