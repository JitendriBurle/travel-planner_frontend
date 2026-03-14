import { OPENWEATHERMAP_API_KEY } from './config';

const CACHE_KEY = 'travelplan_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const getCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
};

const setCache = (key, data) => {
  const cache = getCache();
  cache[key] = { data, timestamp: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

export const getWeather = async (city) => {
  if (!city) return null;
  
  const cacheKey = `weather-${city.toLowerCase().trim()}`;
  const cache = getCache();
  const cached = cache[cacheKey];
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // 1. Geocoding
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('City not found');
    }

    const { latitude, longitude, name, country_code } = geoData.results[0];

    // 2. Weather
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`);
    const weatherData = await weatherRes.json();

    const current = weatherData.current_weather;
    const weather = {
      temp: Math.round(current.temperature),
      feelsLike: Math.round(current.temperature), // Open-Meteo basic doesn't have feels_like in current
      condition: getWeatherCondition(current.weathercode),
      description: getWeatherCondition(current.weathercode),
      icon: null,
      iconEmoji: getWeatherEmoji(current.weathercode),
      humidity: weatherData.hourly.relativehumidity_2m[0],
      windSpeed: Math.round(current.windspeed),
      city: name,
      country: country_code,
    };
    
    setCache(cacheKey, weather);
    return weather;
  } catch (err) {
    console.warn('Weather API error:', err);
    return getFallbackWeather(city);
  }
};

export const getWeatherForecast = async (city) => {
  if (!city) return null;

  try {
    // 1. Geocoding
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('City not found');
    }

    const { latitude, longitude } = geoData.results[0];

    // 2. Forecast
    const forecastRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`);
    const forecastData = await forecastRes.json();
    
    const days = forecastData.daily.time.map((date, i) => ({
      date,
      temp: Math.round(forecastData.daily.temperature_2m_max[i]),
      condition: getWeatherCondition(forecastData.daily.weathercode[i]),
      icon: null,
      iconEmoji: getWeatherEmoji(forecastData.daily.weathercode[i]),
      description: getWeatherCondition(forecastData.daily.weathercode[i]),
    }));
    
    return days.slice(0, 5);
  } catch (err) {
    console.warn('Forecast API error:', err);
    return getFallbackForecast(city);
  }
};

const getWeatherCondition = (code) => {
  const conditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
  };
  return conditions[code] || 'Cloudy';
};

const getWeatherEmoji = (code) => {
  if (code === 0) return '☀️';
  if (code <= 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 75) return '❄️';
  if (code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '☁️';
};

const weatherTypes = [
  { condition: 'Clear', description: 'clear sky', icon: '☀️', temp: 28 },
  { condition: 'Clouds', description: 'partly cloudy', icon: '☁️', temp: 24 },
  { condition: 'Rain', description: 'light rain', icon: '🌧️', temp: 18 },
  { condition: 'Drizzle', description: 'drizzle', icon: '🌦️', temp: 20 },
  { condition: 'Snow', description: 'light snow', icon: '❄️', temp: -2 },
];

const getFallbackWeather = (city) => {
  const hash = city.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const w = weatherTypes[hash % weatherTypes.length];
  return {
    temp: w.temp + (hash % 10) - 5,
    feelsLike: w.temp + (hash % 8) - 4,
    condition: w.condition,
    description: w.description,
    icon: null,
    iconEmoji: w.icon,
    humidity: 40 + (hash % 40),
    windSpeed: 5 + (hash % 20),
    city: city,
    country: '',
    isFallback: true,
  };
};

const getFallbackForecast = (city) => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const hash = (city + i).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const w = weatherTypes[hash % weatherTypes.length];
    days.push({
      date: d.toISOString().split('T')[0],
      temp: w.temp + (hash % 10) - 5,
      condition: w.condition,
      icon: null,
      iconEmoji: w.icon,
      description: w.description,
    });
  }
  return days;
};
