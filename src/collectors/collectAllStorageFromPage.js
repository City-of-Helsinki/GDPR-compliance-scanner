import { collectCookies } from './storages/cookies.js';
import { collectLocalStorage } from './storages/localStorage.js';
import { collectSessionStorage } from './storages/sessionStorage.js';
import { collectIndexedDB } from './storages/indexedDB.js';
import { collectCacheStorage } from './storages/cacheStorage.js';

/**
 * Collects data from all frames in a given page.
 * @param {BrowserContext} context - A Playwright browser context object.
 * @param {Page} page - A Playwright page object.
 * @returns {Promise<Object>} - A promise that resolves to an array of objects, each representing the data for a specific frame.
 */
async function collectAllStorageFromPage(context, page, frameDomains) {
  try {
    const pageFrames = page.frames();
    const allStorageData = [];

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
      // convert frameDomain object {'example.com': 1} to an array with objects like {domain: 'example.com', hits: 1}
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

    // console.log(`Collected data from ${frames.length} frames on page (${page.url()})`,allStorageData);

    return allStorageData;
  } catch (error) {
    console.error(`Error collecting data from all frames on page (${page.url()}):`, error);
    return [];
  }
}

export { collectAllStorageFromPage };
