const nodebug = { headless: true, pause: false }
// eslint-disable-next-line no-unused-vars
const debug = { headless: false, pause: true };

const config = {
  name: 'tiivistamo',
  mainUrl: 'https://tiivistamo.fi/',
  apiUrl: 'https://tiivistamo.fi//wp-json/helfi-cookie-consent/v1/settings'+'?cacheBuster='+Date.now(),
  settingsDomainSubstitution: 'https://tiivistamo.fi/',
  urls: [
    {
      only: false,
      nameBase: 'Frontpage',
      url: 'https://tiivistamo.fi/',
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
