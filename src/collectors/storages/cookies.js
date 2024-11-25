/**
 * Collects cookie data from a given frame.
 * @param {BrowserContext} context - A Playwright browser context object.
 * @param {Frame} frame - A Playwright frame object.
 * @returns {Promise<Object>} - A promise that resolves to an object containing cookies data.
 */
async function collectCookies(context, frame, frameTimestamp) {
  try {
    const frameUrl = frame.url();
    const cookies = await context.cookies(frameUrl);
    cookies.forEach(cookie => {
      cookie.frameTimestamp = frameTimestamp;
    });
    return cookies;
  } catch (error) {
    console.error(`Error collecting cookies from frame (${frame.url()}):`, error);
    return null; // Returning null in case of error to indicate failure in collection
  }
}


export { collectCookies };
