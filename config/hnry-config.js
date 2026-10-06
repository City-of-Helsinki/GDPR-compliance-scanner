const nodebug = { headless: true, pause: false }
// eslint-disable-next-line no-unused-vars
const debug = { headless: false, pause: true };

const config = {
  name: 'hnry',
  mainUrl: 'https://hnry.fi',
  apiUrl: 'https://hnry.fi/wp-json/helfi-cookie-consent/v1/settings'+'?cacheBuster='+Date.now(),
  settingsDomainSubstitution: 'https://hnry.fi',
  urls: [
    {
      only: false,
      nameBase: 'Frontpage',
      url: 'https://hnry.fi',
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
