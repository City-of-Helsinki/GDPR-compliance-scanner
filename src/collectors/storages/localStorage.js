/**
 * Collects localStorage data from a given frame.
 * @param {Frame} frame - A Playwright frame object.
 * @returns {Promise<Object>} - A promise that resolves to an object containing key-value pairs of the localStorage data.
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
    return null; // Returning null in case of error to indicate failure in collection
  }
}

export { collectLocalStorage };
