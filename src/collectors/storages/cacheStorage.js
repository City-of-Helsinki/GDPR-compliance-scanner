/**
 * Collects cacheStorage data from a given frame.
 * @param {Frame} frame - A Playwright frame object.
 * @returns {Promise<Object>} - A promise that resolves to an object containing cacheStorage data.
 */
async function collectCacheStorage(context, frame) {
  try {
    // Collect CacheStorage data for the current frame
    const cacheStorageData = await frame.evaluate(async () => {
      let cachesData = {};
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
