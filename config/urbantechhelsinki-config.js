const nodebug = { headless: true, pause: false }
// eslint-disable-next-line no-unused-vars
const debug = { headless: false, pause: true };

const config = {
  name: 'urbantechhelsinki',
  mainUrl: 'https://urbantechhelsinki.fi',
  apiUrl: 'https://urbantechhelsinki.fi/wp-json/helfi-cookie-consent/v1/settings'+'?cacheBuster='+Date.now(),
  settingsDomainSubstitution: 'https://urbantechhelsinki.fi',
  urls: [
    {
      only: false,
      nameBase: 'Frontpage',
      url: 'https://urbantechhelsinki.fi',
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
