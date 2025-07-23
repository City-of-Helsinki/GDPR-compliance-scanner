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

(async () => {
  for (const file of configFiles) {
    const config = (await import(path.join(configDir, file))).config;

    timer.start('Total time');
    timer.start('Processing time');

    const trackingDomains = fetchTrackingDomains(timer);

    console.log(`Starting 🍪 GDPR Compliance scan for ${file}...`);
    timer.start('Fetching checksums and siteSettings');

    let hashesAndExpires = {};
    let settings = {};

    try {
      [hashesAndExpires, settings] = await Promise.all([
        collectGroupHashes(config.mainUrl),
        collectGroupSettings(config.apiUrl)
      ]);
    }
    // eslint-disable-next-line no-unused-vars
    catch (error) {
      console.error('Error:', error.message);
      console.log('skipping: ', config.apiUrl)
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
      inventoryItems: updatedinventoryItems,
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
      updatedinventoryItems,
      foundItems,
      siteSettingsFlat,
      timer,
    );
    timer.end(`Report generation`);

    await trackingDomains;

    timer.end('Total time');
  }
})();
