/**
 * Collects indexedDB data from a given frame
 * @param {import('playwright').BrowserContext} context - Playwright browser context
 * @param {import('playwright').Frame} frame - Playwright frame to collect data from
 * @returns {Promise<Array<{key: string, value: string}>>} Array of indexedDB entries where:
 *   - key: Database name and store name (e.g., "dbName/storeName")
 *   - value: String describing number of items (e.g., "5 items")
 * @throws {Error} If indexedDB collection fails
 */
async function collectIndexedDB(context, frame) {
  try {
    // Collect indexedDB data for the current frame
    const indexedDBData = await frame.evaluate(async () => {
      let entries = [];
      const dbs = await indexedDB.databases();

      for (const dbInfo of dbs) {
        const db = await new Promise((resolve) => {
          const request = indexedDB.open(dbInfo.name);
          request.onsuccess = () => resolve(request.result);
        });

        for (let i = 0; i < db.objectStoreNames.length; i++) {
          const storeName = db.objectStoreNames[i];
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const count = await new Promise((resolve) => {
            const countRequest = store.count();
            countRequest.onsuccess = () => resolve(countRequest.result);
          });

          entries.push({
            key: `${dbInfo.name}/${storeName}`,
            value: `${count} items`
          });
        }
      }
      return entries;
    });
    return indexedDBData;
  } catch (error) {
    console.error(`Error collecting indexedDB from frame (${frame.url()}):`, error);
    return [];
  }
}

export { collectIndexedDB };
