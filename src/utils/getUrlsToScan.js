/**
 * Predefined variant groups for cookie consent
 * @type {Object.<string, Array<string>>}
 */
const VARIANTS = {
  none: [],
  required: [],
  optional: [],
  all: [],
};

/**
 * Generates a cookie object for the given groups and expiration
 * @param {Object} groupHashes - Hash values for each consent group
 * @param {Array<string>} groups - Array of group identifiers to include in cookie
 * @param {number} expires - Cookie expiration timestamp
 * @returns {Object} Cookie object with consent configuration
 */
function generateCookie(groupHashes, groups, expires) {
  const value = {
    groups: {},
  };

  // Loop through the groups array and find matching groupHashes
  for (const group of groups) {
    if (groupHashes[group]) {
      value.groups[group] = groupHashes[group];
    } else {
      console.error(`Group ${group} not found in groupHashes`, groupHashes);
    }
  }

  const cookie = {
    "name": "helfi-cookie-consents",
    "value": encodeURIComponent(JSON.stringify(value)),
    "domain": "www.test.hel.ninja",
    "path": "/",
    "expires": expires,
    "httpOnly": false,
    "secure": false,
    "sameSite": "Strict"
  };

  return cookie;
}

/**
 * Generates a list of URLs to scan with different cookie consent configurations
 * @param {Array<Object>} configUrls - Array of URL configurations to process
 * @param {Object} groupHashes - Hash values for each consent group
 * @param {Array<Object>} groupSettings - Settings for different cookie groups
 * @param {number} expires - Cookie expiration timestamp
 * @returns {Array<Object>} Array of URL configurations with:
 *   - name: String identifier for the scan
 *   - url: URL to scan
 *   - skipNetworkIdle: Whether to skip network idle wait
 *   - waitForNetworkIdle: Time to wait for network idle
 *   - actions: Array of actions to perform
 *   - cookies: Array of cookie configurations
 *   - groups: Array of group identifiers
 *   - headless: Whether to run in headless mode
 *   - pause: Whether to pause for debugging
 */
function getUrlsToScan(configUrls, groupHashes, groupSettings, expires) {
  // Populate the VARIANTS object with groupIds
  for(const groupSetting of groupSettings) {
    if (groupSetting.required) {
      VARIANTS.required.push(groupSetting.groupId);
    } else {
      VARIANTS.optional.push(groupSetting.groupId);
    }
    VARIANTS.all.push(groupSetting.groupId);
  }

  const urlsToScan = [];

  for (const configUrl of configUrls) {
    if (configUrl.variants) {
      for (const variant of configUrl.variants) {
        const cookies = [];
        const groups = [];
        if (typeof variant === 'string') {
          if(VARIANTS[variant]) {
            cookies.push(generateCookie(groupHashes, VARIANTS[variant], expires));
            groups.push(...VARIANTS[variant]);
          }
        } else {
          cookies.push(generateCookie(groupHashes, variant, expires));
          for (const group of variant) {
            groups.push(group);
          }
        }

        urlsToScan.push({
          name: `${configUrl.nameBase} with ${variant} accepted`,
          url: configUrl.url,
          skipNetworkIdle: configUrl.skipNetworkIdle,
          waitForNetworkIdle: configUrl.waitForNetworkIdle,
          actions: configUrl.actions,
          cookies: cookies,
          groups,
          headless: configUrl.headless,
          pause: configUrl.pause,
        });
      }
    }
  }
  return urlsToScan;
}

export {
  getUrlsToScan,
};
