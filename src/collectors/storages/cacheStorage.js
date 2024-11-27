/**
 * Collects cacheStorage data from a given frame
 * @param {import('playwright').BrowserContext} context - Playwright browser context
 * @param {import('playwright').Frame} frame - Playwright frame to collect data from
 * @returns {Promise<Array<{key: string, value: string}>>} Array of cache entries where:
 *   - key: Cache name
 *   - value: String describing number of items (e.g., "5 items")
 * @throws {Error} If cache collection fails
 */
async function collectCacheStorage(context, frame) {
  try {
    // Collect CacheStorage data for the current frame
    const cacheStorageData = await frame.evaluate(async () => {
      let cachesData = {};

      // Get all cache names and count their items
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        // Instead of collecting full response data, just count the items
        cachesData[name] = {
          key: name,
          value: `${requests.length} items`
        };
      }
      return Object.values(cachesData);
    });

    return cacheStorageData;
  } catch (error) {
    console.error(`Error collecting cacheStorage from frame (${frame.url()}):`, error);
    return null; // Returning null in case of error to indicate failure in collection
  }
}

export { collectCacheStorage };
