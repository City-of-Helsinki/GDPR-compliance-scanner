import fs from 'fs';

/**
 * Generates a compliance report from collected data and saves it to disk
 * @param {Object} config - Configuration object for the scan
 * @param {string} config.mainUrl - Main URL being scanned
 * @param {string} config.settingsDomainSubstitution - Domain substitution for settings
 * @param {string} config.apiUrl - API URL for fetching settings
 * @param {Array} config.urls - Array of URLs to scan
 * @param {Object} groupHashes - Cookie consent group identifiers
 * @param {Object} groupSettings - Settings for different cookie groups
 * @param {Object} siteSettings - Raw site settings data
 * @param {Array} urls - Array of URLs that were scanned
 * @param {Array} inventoryItems - Collection of storage items found during scanning
 * @param {Array} foundItems - Array of compliance check results
 * @param {Array} siteSettingsFlat - Flattened array of site settings
 * @param {Object} timer - Timer instance with performance data
 * @returns {Object} Generated compliance report containing:
 *   - timeStamp: ISO timestamp of report generation
 *   - summary: Object with compliance statistics
 *   - config: Scan configuration
 *   - groupHashes: Cookie consent group identifiers
 *   - groupSettings: Cookie group settings
 *   - siteSettings: Raw site settings
 *   - urls: Scanned URLs
 *   - inventoryItems: Found storage items
 *   - foundItems: Compliance results
 *   - siteSettingsFlat: Flattened settings
 *   - timing: Performance timing data
 * @throws {Error} If writing report files fails
 */
function generateReport(
  config,
  groupHashes,
  groupSettings,
  siteSettings,
  urls,
  inventoryItems,
  foundItems,
  siteSettingsFlat,
  timer,
) {
  const timeStamp = new Date().toISOString();
  const timing = timer.getReport();

  const complianceReport = {
    timeStamp,
    summary: {
      total: 0,
      compliant: 0,
      nonCompliant: 0,
      warnings: 0,
      urls: urls.length,
      failedUrls: urls.length - inventoryItems.length,
      timing: timing['Processing time'].formattedElapsed,
      siteSettingsFlat: siteSettingsFlat.length,
    },
    config: {
      mainUrl: config.mainUrl,
      settingsDomainSubstitution: config.settingsDomainSubstitution,
      apiUrl: config.apiUrl,
      urls: config.urls,
    },
    groupHashes,
    groupSettings,
    siteSettings,
    urls,
    inventoryItems,
    foundItems,
    siteSettingsFlat,
    timing,
  };

  // Calculate compliance statistics
  for (const complianceIndex in foundItems) {
    const compliance = foundItems[complianceIndex];
    complianceReport.summary.total++;
    if (compliance.compliant) {
      complianceReport.summary.compliant++;
    } else {
      complianceReport.summary.nonCompliant++;
    }
  }

  // Load or initialize history
  let history;
  try {
    history = JSON.parse(fs.readFileSync('./reports/json/history.json'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      history = [];
    } else {
      throw err;
    }
  }

  // Create history entry and save files
  const filename = `report-${timeStamp}.json`;
  const path = './reports/json/';
  const historyEntry = {
    timeStamp,
    summary: complianceReport.summary,
    filename,
  };

  history.push(historyEntry);

  fs.writeFileSync('./reports/json/history.json', JSON.stringify(history, null, 2));
  fs.writeFileSync(path + filename, JSON.stringify(complianceReport, null, 2));

  return complianceReport;
}

export { generateReport };
