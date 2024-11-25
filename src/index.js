import { config } from '../config/config.js';
import { getUrlsToScan } from './utils/getUrlsToScan.js';
import { collectGroupHashes } from './collectors/collectGroupHashes.js';
import { collectGroupSettings } from './collectors/collectGroupSettings.js';
import { collectDataFromPages } from './collectors/collectDataFromPages.js';
import { checkCompliance } from './compliance/checkCompliance.js';
import { generateReport } from './reporter/generateReport.js';
import timer from './utils/timer.js';
import { fetchTrackingDomains } from './utils/fetchTrackingDomains.js';
// Run on a list of URLs
(async () => {
  timer.start('Total time');
  timer.start('Processing time');

  // Start fetching tracking domains
  const trackingDomains = fetchTrackingDomains(timer);

  // eslint-disable-next-line no-console
  console.log('Starting 🍪 GDPR Compliance scan...');
  timer.start('Fetching checksums and siteSettings');

  // Get group checksums and siteSettings regarding cookie groups
  const [hashesAndExpires, settings] = await Promise.all([
    collectGroupHashes(config.mainUrl),
    collectGroupSettings(config.apiUrl)
  ]);
  const { groupHashes, expires } = hashesAndExpires;
  const { groupSettings, siteSettings } = settings;

  timer.end('Fetching checksums and siteSettings');
  timer.start('URL generation');

  let filteredUrlConfigs = config.urls.filter(urlConfig => urlConfig.only);

  if (filteredUrlConfigs.length === 0) {
    filteredUrlConfigs = config.urls;
  }

  // Generate URLs for data collection
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

  // Wait for tracking domains to be fetched
  await trackingDomains;

  timer.end('Total time');
  // console.log(process._getActiveHandles());
  // console.log(process._getActiveRequests());
})();
