/**
 * Collects localStorage data from a given frame
 * @param {import('playwright').BrowserContext} context - Playwright browser context
 * @param {import('playwright').Frame} frame - Playwright frame to collect data from
 * @returns {Promise<Array<{key: string, value: string}>>} Array of localStorage entries
 *   containing key-value pairs from the storage
 * @throws {Error} If localStorage collection fails
 */
async function collectLocalStorage(context, frame) {
  try {
    // Evaluate script in the frame context to extract localStorage items
    const localStorageData = await frame.evaluate(() => {
      let data = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        const value = window.localStorage.getItem(key);
        data.push({ key, value });
      }
      return data;
    });
    return localStorageData;
  } catch (error) {
    console.error(`Error collecting localStorage from frame (${frame.url()}):`, error);
    return null;
  }
}

export { collectLocalStorage };
