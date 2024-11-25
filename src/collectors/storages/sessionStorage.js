/**
 * Collects sessionStorage data from a given frame.
 * @param {Frame} frame - A Playwright frame object.
 * @returns {Promise<Object>} - A promise that resolves to an object containing key-value pairs of the sessionStorage data.
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
    return null; // Returning null in case of error to indicate failure in collection
  }
}

export { collectSessionStorage };
