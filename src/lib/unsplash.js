import { UNSPLASH_ACCESS_KEY } from './config';

const CACHE_KEY = 'travelplan_unsplash_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

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

const fallbackImages = {
  default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
  maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
  switzerland: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80',
  bangkok: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
  morocco: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80',
  norway: 'https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=800&q=80',
  italy: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
  japan: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
  amsterdam: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&q=80',
  singapore: 'https://images.unsplash.com/photo-1525625239911-37d45af3899f?w=800&q=80',
  berlin: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80',
  travel: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  adventure: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80',
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  culture: 'https://images.unsplash.com/photo-1533669955142-6a73332af4db?w=800&q=80',
  nature: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
};

const getFallbackImage = (query) => {
  const lower = query.toLowerCase();
  for (const [key, url] of Object.entries(fallbackImages)) {
    if (lower.includes(key)) return url;
  }
  return fallbackImages.default;
};

export const getDestinationImage = async (query, size = 'regular') => {
  if (!query) return fallbackImages.default;

  const cacheKey = `${query.toLowerCase().trim()}_${size}`;
  const cache = getCache();
  const cached = cache[cacheKey];

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
    return getFallbackImage(query);
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' travel destination')}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    if (!res.ok) throw new Error('Unsplash fetch failed');
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const url = data.results[0].urls[size] || data.results[0].urls.regular;
      setCache(cacheKey, url);
      return url;
    }
    return getFallbackImage(query);
  } catch (err) {
    console.warn('Unsplash API error:', err);
    return getFallbackImage(query);
  }
};

export const getMultipleImages = async (query, count = 6) => {
  if (!query) return [fallbackImages.default];

  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
    return [getFallbackImage(query)];
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    if (!res.ok) throw new Error('Unsplash fetch failed');
    const data = await res.json();
    return data.results.map(r => r.urls.regular);
  } catch (err) {
    console.warn('Unsplash API error:', err);
    return [getFallbackImage(query)];
  }
};
