const nodebug = { headless: true, pause: false }
// eslint-disable-next-line no-unused-vars
const debug = { headless: false, pause: true };

const config = {
  name: 'spouseprogram',
  mainUrl: 'https://spouseprogram.fi',
  apiUrl: 'https://spouseprogram.fi/wp-json/helfi-cookie-consent/v1/settings'+'?cacheBuster='+Date.now(),
  settingsDomainSubstitution: 'https://spouseprogram.fi',
  urls: [
    {
      only: false,
      nameBase: 'Frontpage',
      url: 'https://spouseprogram.fi',
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
