import getCookieExpirationText from '../../reports/js/getCookieExpirationText.js';

const TYPES = {
  cookie: 1,
  localStorage: 2,
  sessionStorage: 3,
  indexedDB: 4,
  cacheStorage: 5,
}

/**
 * Flattens group settings into an array of individual storage item settings
 * @param {Object} groupSettings - Object containing settings for different cookie/storage groups
 * @returns {Array} Array of flattened storage item settings with groupId and required status
 */
function getStorageItemSettings(groupSettings) {
  const siteSettingsFlat = [];

  for (const groupSetting in groupSettings) {
    const {
      groupId,
      required,
      cookies,
    } = groupSettings[groupSetting];
    for (const cookie in cookies) {
      siteSettingsFlat.push({
        groupId,
        required,
        ...cookies[cookie],
      });
    }
  }
  return siteSettingsFlat;
}

/**
 * Checks compliance of a single storage item against site settings
 * @param {number} type - Storage type identifier (1=cookie, 2=localStorage, etc)
 * @param {Object} item - The storage item to check
 * @param {string} itemId - Identifier for the storage item (name for cookies, key for others)
 * @param {Array} groups - Groups that this item belongs to
 * @param {Array} siteSettingsFlat - Flattened array of site settings to check against
 * @param {string} name - Name of the page/context where item was found
 * @param {string} url - URL where the item was found
 * @param {string} frameUrl - URL of the frame if item was found in a frame
 * @param {string} mainUrl - Main URL of the site being scanned
 * @param {string} settingsDomainSubstitution - Domain to substitute in URL checks
 * @returns {Object} Compliance check results including matching settings
 */
function checkItemCompliance(
  type,
  item,
  itemId,
  groups,
  siteSettingsFlat,
  name,
  url,
  frameUrl,
  mainUrl,
  settingsDomainSubstitution
) {
  let compliant = false;
  const matchingSettings = [];

  let matches;

  matches = siteSettingsFlat.filter(setting => {
    const escapedSettingName = setting.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace('\\*', '.*');
    const nameMatches = new RegExp(`^${escapedSettingName}$`).test(itemId);
    return nameMatches;
  });

  matches = matches.filter(match => {
    return match.type === type;
  });

  let fixedUrl = url;
  if (url.includes(mainUrl)) {
    fixedUrl = url.replace(mainUrl, settingsDomainSubstitution);
  }

  matches = matches.map(match => {
    const escapedSettingHost = match.host.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace('\\*', '.*');
    match.hostMatches = new RegExp(`^(https?://)?${escapedSettingHost}.*$`).test(fixedUrl);

    if (type === 1) {
      item.expirationText = getCookieExpirationText(item.frameTimestamp, item.expires);
      match.expiresMatches = item.expirationText === match.expiration;
    } else {
      match.expiresMatches = match.expiration === '-';
    }

    return match;
  });

  matchingSettings.push(...matches);

  if (matchingSettings.length > 0) {
    compliant = true;
  }

  const compliance = {
    type,
    itemId,
    item,
    groups,
    name,
    url,
    frameUrl,
    compliant,
    complianceData: {
      compliant,
      matchingSettings,
    },
  };
  return compliance;
}

/**
 * Checks compliance of all storage items in inventory against site settings
 * @param {Object} groupHashes - Hashes identifying different cookie/storage groups
 * @param {Object} groupSettings - Settings for different cookie/storage groups
 * @param {Object} inventoryItems - Collection of storage items found during scanning
 * @param {string} mainUrl - Main URL of the site being scanned
 * @param {string} settingsDomainSubstitution - Domain to substitute in URL checks
 * @returns {Object} Object containing:
 *   - foundItems: Array of all storage items with compliance results
 *   - siteSettingsFlat: Flattened array of site settings used for checking
 *   - inventoryItems: Updated inventory items with compliance results
 * @throws {Error} If compliance check fails
 */
function checkCompliance(
  groupHashes,
  groupSettings,
  inventoryItems,
  mainUrl,
  settingsDomainSubstitution
) {
  try {
    const siteSettingsFlat = getStorageItemSettings(groupSettings);

    const foundItems = [];

    for (const inventoryItem in inventoryItems) {
      const {
        name,
        groups,
        url,
        frames,
      } = inventoryItems[inventoryItem];

      inventoryItems[inventoryItem].allCompliant = true;


      for (const frame in frames) {
        const {
          frameUrl,
          cookies,
          localStorage,
          sessionStorage,
          indexedDB,
          cacheStorage,
        } = frames[frame];

        inventoryItems[inventoryItem].frames[frame].compliant = true;

        const storageTypes = {
          cookies: { type: TYPES.cookie, getKey: item => item.name },
          localStorage: { type: TYPES.localStorage, getKey: item => item.key },
          sessionStorage: { type: TYPES.sessionStorage, getKey: item => item.key },
          indexedDB: { type: TYPES.indexedDB, getKey: item => item.key },
          cacheStorage: { type: TYPES.cacheStorage, getKey: item => item.key }
        };

        for (const [storageKey, storage] of Object.entries({
          cookies,
          localStorage,
          sessionStorage,
          indexedDB,
          cacheStorage
        })) {
          const { type, getKey } = storageTypes[storageKey];

          for (const item in storage) {
            const compliance = checkItemCompliance(
              type,
              storage[item],
              getKey(storage[item]),
              groups,
              siteSettingsFlat,
              name,
              url,
              frameUrl,
              mainUrl,
              settingsDomainSubstitution
            );
            storage[item].compliance = compliance.complianceData;
            foundItems.push(compliance);
            if (!compliance.compliant) {
              inventoryItems[inventoryItem].frames[frame].compliant = false;
            }
          }
        }
        if (!inventoryItems[inventoryItem].frames[frame].compliant) {
          inventoryItems[inventoryItem].allCompliant = false;
        }
      }
    }


    return { foundItems, siteSettingsFlat, inventoryItems };
  } catch (error) {
    console.error('Error during compliance check:', error);
    throw new Error('Compliance check failed: ' + error.message);
  }
}

export { checkCompliance };
