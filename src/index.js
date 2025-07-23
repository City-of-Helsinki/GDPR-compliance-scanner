import fs from 'fs';
import path from 'path';
import { getUrlsToScan } from './utils/getUrlsToScan.js';
import { collectGroupHashes } from './collectors/collectGroupHashes.js';
import { collectGroupSettings } from './collectors/collectGroupSettings.js';
import { collectDataFromPages } from './collectors/collectDataFromPages.js';
import { checkCompliance } from './compliance/checkCompliance.js';
import { generateReport } from './reporter/generateReport.js';
import timer from './utils/timer.js';
import { fetchTrackingDomains } from './utils/fetchTrackingDomains.js';

const configDir = path.resolve('./config');
const configFiles = fs.readdirSync(configDir).filter(file => file.endsWith('.js'));

// Set a global timeout for the entire process (20 minutes)
const GLOBAL_TIMEOUT = 20 * 60 * 1000;

(async () => {
  const startTime = Date.now();

  for (const file of configFiles) {
    try {
      // Check if we're approaching the global timeout.
      if (Date.now() - startTime > GLOBAL_TIMEOUT * 0.9) {
        console.warn('Approaching global timeout, skipping remaining configurations');
        break;
      }

      const config = (await import(path.join(configDir, file))).config;
      const configStartTime = Date.now();

      timer.start('Total time');
      timer.start('Processing time');

      const trackingDomains = fetchTrackingDomains(timer);

      // eslint-disable-next-line no-console
      console.log(`\nStarting 🍪 GDPR Compliance scan for ${file}...`);
      timer.start('Fetching checksums and siteSettings');

      let hashesAndExpires = {};
      let settings = {};

      try {
        [hashesAndExpires, settings] = await Promise.all([
          collectGroupHashes(config.mainUrl),
          collectGroupSettings(config.apiUrl)
        ]);
      }
      catch (error) {
        console.error('Error:', error.message);
        // eslint-disable-next-line no-console
        console.log('Skipping: ', config.apiUrl)
        continue;
      }

      const { groupHashes, expires } = hashesAndExpires;
      const { groupSettings, siteSettings } = settings;

      timer.end('Fetching checksums and siteSettings');
      timer.start('URL generation');

      let filteredUrlConfigs = config.urls.filter(urlConfig => urlConfig.only);
      if (filteredUrlConfigs.length === 0) {
        filteredUrlConfigs = config.urls;
      }

      const urls = getUrlsToScan(filteredUrlConfigs, groupHashes, groupSettings, expires);
      timer.end('URL generation');

      timer.start(`Data collection`);
      let inventoryItems = await collectDataFromPages(urls, timer);
      timer.end(`Data collection`);
      timer.end('Processing time');

      timer.start(`Compliance checking`);
      const {
        foundItems,
        siteSettingsFlat,
        inventoryItems: updatedInventoryItems,
      } = checkCompliance(
        groupHashes,
        groupSettings,
        inventoryItems,
        config.mainUrl,
        config.settingsDomainSubstitution
      );
      timer.end(`Compliance checking`);

      timer.start(`Report generation`);
      generateReport(
        {
          urls: filteredUrlConfigs,
          ...config,
        },
        groupHashes,
        groupSettings,
        siteSettings,
        urls,
        updatedInventoryItems,
        foundItems,
        siteSettingsFlat,
        timer,
      );
      timer.end(`Report generation`);

      await trackingDomains;

      timer.end('Total time');

      // eslint-disable-next-line no-console
      console.log(`✅ Completed processing ${file} in ${((Date.now() - configStartTime) / 1000).toFixed(2)}s`);
    }
    catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }
    finally {
      // Add a small delay between configurations.
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // eslint-disable-next-line no-console
  console.log('All configurations processed');
  // eslint-disable-next-line no-console
  console.log(`Total execution time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);

  // Ensure the process exits cleanly.
  process.exit(0);
})().catch(error => {
  console.error('Fatal error in main process:', error);
  process.exit(1);
});
