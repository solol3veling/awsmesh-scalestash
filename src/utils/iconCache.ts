// Icon caching utility using Cache API and IndexedDB
const CACHE_NAME = 'awsmesh-icons-v1';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

interface CacheMetadata {
  url: string;
  timestamp: number;
}

// Initialize cache storage
export const initIconCache = async (): Promise<void> => {
  try {
    // Check if Cache API is supported
    if ('caches' in window) {
      await caches.open(CACHE_NAME);
    }
  } catch (error) {
    console.warn('Cache API not available:', error);
  }
};

// Get icon from cache or fetch and cache it
export const getCachedIcon = async (iconPath: string): Promise<string> => {
  try {
    // Check if Cache API is supported
    if (!('caches' in window)) {
      return iconPath; // Fallback to direct path
    }

    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(iconPath);

    // If cached and not expired, return cached URL
    if (cachedResponse) {
      const cacheTime = cachedResponse.headers.get('X-Cache-Time');
      if (cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < CACHE_DURATION) {
          // Return the cached blob URL
          const blob = await cachedResponse.blob();
          return URL.createObjectURL(blob);
        }
      }
    }

    // Fetch the icon
    const response = await fetch(iconPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch icon: ${iconPath}`);
    }

    // Clone response and add cache timestamp
    const responseToCache = new Response(response.clone().body, {
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'X-Cache-Time': Date.now().toString(),
      },
    });

    // Cache the response
    await cache.put(iconPath, responseToCache);

    // Return blob URL for immediate use
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn('Error caching icon:', error);
    return iconPath; // Fallback to direct path
  }
};

// Preload icons into cache (call this in the background)
export const preloadIcons = async (iconPaths: string[]): Promise<void> => {
  try {
    if (!('caches' in window)) {
      return;
    }

    const cache = await caches.open(CACHE_NAME);

    // Process in batches to avoid overwhelming the browser
    const BATCH_SIZE = 10;
    for (let i = 0; i < iconPaths.length; i += BATCH_SIZE) {
      const batch = iconPaths.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(async (iconPath) => {
          try {
            const cachedResponse = await cache.match(iconPath);
            if (cachedResponse) {
              return; // Already cached
            }

            const response = await fetch(iconPath);
            if (response.ok) {
              const responseToCache = new Response(response.clone().body, {
                headers: {
                  ...Object.fromEntries(response.headers.entries()),
                  'X-Cache-Time': Date.now().toString(),
                },
              });
              await cache.put(iconPath, responseToCache);
            }
          } catch (error) {
            console.warn(`Failed to preload icon: ${iconPath}`, error);
          }
        })
      );

      // Small delay between batches to avoid blocking
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  } catch (error) {
    console.warn('Error preloading icons:', error);
  }
};

// Clear old cache entries
export const clearExpiredCache = async (): Promise<void> => {
  try {
    if (!('caches' in window)) {
      return;
    }

    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();

    for (const request of requests) {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        const cacheTime = cachedResponse.headers.get('X-Cache-Time');
        if (cacheTime) {
          const age = Date.now() - parseInt(cacheTime);
          if (age >= CACHE_DURATION) {
            await cache.delete(request);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Error clearing expired cache:', error);
  }
};

// Clear all icon cache
export const clearIconCache = async (): Promise<void> => {
  try {
    if ('caches' in window) {
      await caches.delete(CACHE_NAME);
    }
  } catch (error) {
    console.warn('Error clearing icon cache:', error);
  }
};

// Get cache statistics
export const getCacheStats = async (): Promise<{ count: number; size: number }> => {
  try {
    if (!('caches' in window)) {
      return { count: 0, size: 0 };
    }

    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    let totalSize = 0;

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }

    return {
      count: requests.length,
      size: totalSize,
    };
  } catch (error) {
    console.warn('Error getting cache stats:', error);
    return { count: 0, size: 0 };
  }
};
