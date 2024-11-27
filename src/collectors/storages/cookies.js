/**
 * Collects cookie data from a given frame
 * @param {import('playwright').BrowserContext} context - Playwright browser context
 * @param {import('playwright').Frame} frame - Playwright frame to collect data from
 * @param {number} frameTimestamp - Timestamp when frame was accessed
 * @returns {Promise<Array<Object>>} Array of cookie objects with frameTimestamp added
 * @throws {Error} If cookie collection fails
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
    return null;
  }
}

export { collectCookies };
