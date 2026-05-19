import { performance } from 'perf_hooks';
import { collectGroupHashes } from '../collectors/collectGroupHashes.js';
import { collectGroupSettings } from '../collectors/collectGroupSettings.js';
import { collectDataFromPages } from '../collectors/collectDataFromPages.js';
import { checkCompliance } from '../compliance/checkCompliance.js';

class ScanTimer {
  constructor() {
    this.timings = {};
  }

  start(label) {
    this.timings[label] = { start: performance.now() };
  }

  end(label) {
    if (this.timings[label]?.start) {
      const elapsed = performance.now() - this.timings[label].start;
      this.timings[label].elapsed = elapsed;
      const mins = Math.floor(elapsed / 60000);
      const secs = ((elapsed % 60000) / 1000).toFixed(2);
      // eslint-disable-next-line no-console
      console.log(`${label}: ${mins > 0 ? `${mins}m ${secs}s` : `${(elapsed / 1000).toFixed(3)}s`}`);
    }
  }

  getReport() {
    return this.timings;
  }
}

function buildVariantUrls(pageUrl, variants, groupHashes, groupSettings, expires) {
  const domain = new URL(pageUrl).hostname;
  const requiredGroupIds = groupSettings.filter(g => g.required).map(g => g.groupId);
  const allGroupIds = groupSettings.map(g => g.groupId);

  return variants.map(variant => {
    let groups;
    if (variant === 'none') groups = [];
    else if (variant === 'required') groups = requiredGroupIds;
    else if (variant === 'all') groups = allGroupIds;
    else groups = [];

    const cookieValue = { groups: {} };
    for (const g of groups) {
      if (groupHashes[g]) cookieValue.groups[g] = groupHashes[g];
    }

    return {
      name: `Page with ${variant} accepted`,
      url: pageUrl,
      skipNetworkIdle: false,
      waitForNetworkIdle: 5000,
      actions: [],
      cookies: [{
        name: 'helfi-cookie-consents',
        value: encodeURIComponent(JSON.stringify(cookieValue)),
        domain,
        path: '/',
        expires,
        httpOnly: false,
        secure: false,
        sameSite: 'Strict',
      }],
      groups,
      headless: true,
      pause: false,
    };
  });
}

export async function runScan(pageUrl, apiUrl, variants, send) {
  const timer = new ScanTimer();
  timer.start('Total');

  send('status', { message: `Fetching cookie group hashes from ${pageUrl}...` });

  const [hashesAndExpires, settings] = await Promise.all([
    collectGroupHashes(pageUrl),
    collectGroupSettings(apiUrl),
  ]);

  const { groupHashes, expires } = hashesAndExpires;
  const { groupSettings } = settings;

  send('status', { message: `Building ${variants.length} variant URL(s) to scan...` });

  const urlsToScan = buildVariantUrls(pageUrl, variants, groupHashes, groupSettings, expires);

  send('status', { message: `Scanning ${urlsToScan.length} variant(s) — this may take several minutes...` });

  const inventoryItems = await collectDataFromPages(urlsToScan, timer);

  send('status', { message: 'Checking compliance against cookie settings...' });

  const { foundItems, siteSettingsFlat } = checkCompliance(
    groupHashes,
    groupSettings,
    inventoryItems,
    pageUrl,
    pageUrl,
  );

  timer.end('Total');

  const summary = {
    total: foundItems.length,
    compliant: foundItems.filter(i => i.compliant).length,
    nonCompliant: foundItems.filter(i => !i.compliant).length,
    variants: variants.length,
    scannedVariants: inventoryItems.length,
  };

  send('result', {
    summary,
    foundItems,
    groupSettings,
    siteSettingsFlat,
    groupHashes,
    pageUrl,
    apiUrl,
    variants,
  });
}
