const nodebug = { headless: true, pause: false }
// eslint-disable-next-line no-unused-vars
const debug = { headless: false, pause: true };

const config = {
  name: 'avustukset',
  mainUrl: 'https://avustukset.dev.hel.ninja/fi/avustukset',
  apiUrl: 'https://avustukset.dev.hel.ninja/en/api/cookie-banner'+'?cacheBuster='+Date.now(),
  settingsDomainSubstitution: 'https://avustukset.dev.hel.ninja/fi/avustukset',
  urls: [
    {
      only: false,
      nameBase: 'Frontpage',
      url: 'https://avustukset.dev.hel.ninja/fi/avustukset',
      actions: [],
      variants: [
        'none',
        'required',
        'all',
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: 'Search',
      url: 'https://avustukset.dev.hel.ninja/fi/etsi-avustusta',
      actions: [],
      variants: [
        'none',
        'required',
        'all',
      ],
      ...nodebug,
    }
  ],
};

export {
  config,
};
