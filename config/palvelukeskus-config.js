const nodebug = { headless: true, pause: false }
// eslint-disable-next-line no-unused-vars
const debug = { headless: false, pause: true };

const config = {
  name: 'palvelukeskus',
  mainUrl: 'https://palvelukeskus.hel.fi/fi',
  apiUrl: 'https://palvelukeskus.hel.fi/en/api/cookie-banner'+'?cacheBuster='+Date.now(),
  settingsDomainSubstitution: 'https://palvelukeskus.hel.fi/fi',
  urls: [
    {
      only: false,
      nameBase: 'Frontpage',
      url: 'https://palvelukeskus.hel.fi/fi',
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
      nameBase: 'Telia ace chat',
      url: 'https://palvelukeskus.hel.fi/fi/helsingin-matkapalvelu',
      actions: [
        {
          type: 'click',
          selector: 'button:has-text("Matkapalvelu chat")',
        },
        {
          type: 'waitForNetworkIdle',
          timeout: 5000,
        },
      ],
      variants: [
        'none',
        'required',
        'all',
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: 'Accordion',
      url: 'https://palvelukeskus.hel.fi/fi/ruokapalvelut/paivakotiruokailu',
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
