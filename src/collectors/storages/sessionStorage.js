/**
 * Collects sessionStorage data from a given frame
 * @param {import('playwright').BrowserContext} context - Playwright browser context
 * @param {import('playwright').Frame} frame - Playwright frame to collect data from
 * @returns {Promise<Array<{key: string, value: string}>>} Array of sessionStorage entries
 *   containing key-value pairs from the storage
 * @throws {Error} If sessionStorage collection fails
 */
async function collectSessionStorage(context, frame) {
  try {
    // Evaluate script in the frame context to extract sessionStorage items
    const sessionStorageData = await frame.evaluate(() => {
      let data = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        const value = window.sessionStorage.getItem(key);
        data.push({ key, value });
      }
      return data;
    });
    return sessionStorageData;
  } catch (error) {
    console.error(`Error collecting sessionStorage from frame (${frame.url()}):`, error);
    return null;
  }
}

export { collectSessionStorage };
