const nodebug = { headless: true, pause: false }
// eslint-disable-next-line no-unused-vars
const debug = { headless: false, pause: true };

const config = {
  name: 'digituki',
  mainUrl: 'https://digituki.hel.fi',
  apiUrl: 'https://digituki.hel.fi/wp-json/helfi-cookie-consent/v1/settings'+'?cacheBuster='+Date.now(),
  settingsDomainSubstitution: 'https://digituki.hel.fi',
  urls: [
    {
      only: false,
      nameBase: 'Frontpage',
      url: 'https://digituki.hel.fi',
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
