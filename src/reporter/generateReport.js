import fs from 'fs';

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
  // console.log(foundItems);

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
      timing:timing['Processing time'].formattedElapsed,
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
    timing: timing,
  }
  for (const complianceIndex in foundItems) {
    const compliance = foundItems[complianceIndex];
    complianceReport.summary.total++;
    if(compliance.compliant) {
      complianceReport.summary.compliant++;
    }else {
      complianceReport.summary.nonCompliant++;
    }
  }

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

  const filename = `report-${timeStamp}.json`;
  const path = `./reports/json/`
  const historyEntry = {
    timeStamp,
    summary: complianceReport.summary,
    filename,
  };

  history.push(historyEntry);

  fs.writeFileSync('./reports/json/history.json', JSON.stringify(history, null, 2));

  fs.writeFileSync(path+filename, JSON.stringify(complianceReport, null, 2));

  return complianceReport;
}

export { generateReport };
