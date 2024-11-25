
const VARIANTS = {
  none: [],
  required: [],
  optional: [],
  all: [],
};

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

  // console.log(JSON.stringify(cookie, null, 2));

  return cookie;
}

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
