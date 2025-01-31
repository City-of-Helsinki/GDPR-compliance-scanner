import fs from 'fs';

/**
 * Generates a compliance report from collected data and saves it to disk
 * @param {Object} config - Configuration object for the scan
 * @param {string} config.name - Name used for organizing reports
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
 * @returns {Object} Generated compliance report
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
      total: foundItems.length,
      compliant: foundItems.filter(item => item.compliant).length,
      nonCompliant: foundItems.filter(item => !item.compliant).length,
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

  // Define report folder and history file paths
  const reportDir = `./reports/json/${config.name}/`;
  const historyFile = `${reportDir}history.json`;

  // Ensure report directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Load or initialize history for this specific config.name
  let history;
  try {
    history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      history = [];
    } else {
      throw err;
    }
  }

  // Generate filename and save report
  const filename = `report-${config.name}-${timeStamp}.json`;
  const filePath = `${reportDir}${filename}`;

  const historyEntry = {
    timeStamp,
    summary: complianceReport.summary,
    filename,
  };

  history.push(historyEntry);

  // Define report folder and history file paths
  const jsonDir = `./reports/json/`;
  const foldersFile = `${jsonDir}folders.json`;

  // Check if the folder exists and update the folders.json
  const folderData = fs.existsSync(foldersFile) ? JSON.parse(fs.readFileSync(foldersFile, 'utf-8')) : { folders: [] };
  
  // Add new folder if it's not already in the list
  if (!folderData.folders.includes(config.name)) {
    folderData.folders.push(config.name);
  }

  // Write the updated folder list to folders.json
  fs.writeFileSync(foldersFile, JSON.stringify(folderData, null, 2));

  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  fs.writeFileSync(filePath, JSON.stringify(complianceReport, null, 2));

  return complianceReport;
}

export { generateReport };
