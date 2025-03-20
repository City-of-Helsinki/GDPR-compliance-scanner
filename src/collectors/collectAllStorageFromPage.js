import { collectCookies } from './storages/cookies.js';
import { collectLocalStorage } from './storages/localStorage.js';
import { collectSessionStorage } from './storages/sessionStorage.js';
import { collectIndexedDB } from './storages/indexedDB.js';
import { collectCacheStorage } from './storages/cacheStorage.js';

/**
 * Collects all storage data from every frame in a given page
 * @param {import('playwright').BrowserContext} context - Playwright browser context
 * @param {import('playwright').Page} page - Playwright page to collect data from
 * @param {Map<Frame, Object>} frameDomains - Map of frames to their domain information
 * @returns {Promise<Array<Object>>} Array of frame data objects containing:
 *   - frameUrl: URL of the frame
 *   - cookies: Array of cookie objects
 *   - localStorage: Array of localStorage entries
 *   - sessionStorage: Array of sessionStorage entries
 *   - indexedDB: Array of indexedDB entries
 *   - cacheStorage: Array of cacheStorage entries
 *   - frameDomains: Array of domain objects with hits and certificates
 *   - frameTimestamp: Unix timestamp when frame was accessed
 * @throws {Error} If data collection fails
 */
async function collectAllStorageFromPage(context, page, frameDomains) {
  try {
    const pageFrames = page.frames();
    const allStorageData = [];

    // @todo Adding timeout here gives more consistent result,
    // but there still is some difference.
    // This still needs a better way to make sure all cookies are present.
    await page.waitForTimeout(8000);

    for (const pageFrame of pageFrames) {
      const frameTimestamp = Math.floor(Date.now() / 1000);
      const [
        frameCookies,
        frameLocalStorage,
        frameSessionStorage,
        frameIndexedDB,
        frameCacheStorage,
      ] = await Promise.all([
        collectCookies(context, pageFrame, frameTimestamp),
        collectLocalStorage(context, pageFrame),
        collectSessionStorage(context, pageFrame),
        collectIndexedDB(context, pageFrame),
        collectCacheStorage(context, pageFrame),
      ]);

      const frameDomain = frameDomains.get(pageFrame);

      let frameDomainArr = [];
      // Convert frameDomain object to array of domain objects
      if(frameDomain) {
        frameDomainArr = Object.keys(frameDomain).map((domain) => {
          return {
            domain,
            hits: frameDomain[domain].count,
            certificate: frameDomain[domain].certificate,
          };
        });
      }

      allStorageData.push({
        frameUrl: pageFrame.url(),
        cookies: frameCookies,
        localStorage: frameLocalStorage,
        sessionStorage: frameSessionStorage,
        indexedDB: frameIndexedDB,
        cacheStorage: frameCacheStorage,
        frameDomains: frameDomainArr,
        frameTimestamp,
      });
    }

    return allStorageData;
  } catch (error) {
    console.error(`Error collecting data from all frames on page (${page.url()}):`, error);
    return [];
  }
}

export { collectAllStorageFromPage };
