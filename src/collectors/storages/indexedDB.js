/**
 * Collects indexedDB data from a given frame.
 * @param {Frame} frame - A Playwright frame object.
 * @returns {Promise<Array>} - A promise that resolves to an array of indexedDB entries.
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
    return []; // Return empty array in case of error to be consistent with other collectors
  }
}

export { collectIndexedDB };
