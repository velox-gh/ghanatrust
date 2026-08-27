import NodeCache from 'node-cache';

// Create a new cache instance with a default TTL (Time To Live) of 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

/**
 * Middleware to cache HTTP responses.
 * @param {number} duration - The TTL in seconds for this specific route.
 */
export const cacheRoute = (duration) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // The key is based on the original URL (includes query parameters)
    const key = `express-cache-${req.originalUrl}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      // If found in cache, send the cached response
      console.log(`[Cache Hit] ${req.originalUrl}`);
      return res.json(cachedResponse);
    } else {
      console.log(`[Cache Miss] ${req.originalUrl}`);
      // Override res.json to intercept the response and cache it
      const originalJson = res.json;
      res.json = (body) => {
        // Restore original res.json to avoid double-calling issues
        res.json = originalJson;
        
        // Cache the response body
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(key, body, duration);
        }
        
        // Send the response
        return res.json(body);
      };
      next();
    }
  };
};

/**
 * Utility to manually clear cache for a specific key or all keys
 * Useful when data is updated (e.g., a new service is added)
 */
export const clearCache = (key) => {
  if (key) {
    cache.del(key);
  } else {
    cache.flushAll();
  }
};
