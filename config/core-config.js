const nodebug = { headless: true, pause: false }
// eslint-disable-next-line no-unused-vars
const debug = { headless: false, pause: true };

const config = {
  name: 'helfi_core',
  mainUrl: 'https://www.hel.fi/fi/',
  apiUrl: 'https://www.hel.fi/en/api/cookie-banner'+'?cacheBuster='+Date.now(),
  settingsDomainSubstitution: 'https://www.hel.fi/fi/',
  urls: [
    {
      only: false,
      nameBase: 'Frontpage',
      url: 'https://www.hel.fi/fi/',
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
      nameBase: 'Siteimprove (Rekry)',
      url: 'https://www.hel.fi/fi/avoimet-tyopaikat',
      actions: [],
      variants: [
        'required',
        'all',
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: 'Helsinkikanava',
      url: 'https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/kotihoito/liikkumissopimus',
      actions: [],
      variants: [
        'required',
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: 'Helsinkikanava',
      url: 'https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/kotihoito/liikkumissopimus',
      actions: [],
      variants: [
        ['essential', 'admin', 'preferences', 'statistics'], // all but chat
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: 'Youtube',
      url: 'https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/toihin-meille/toissa-meilla/laakari-tomas-lundqvist-nakee-laaketieteen-koko-kentan',
      actions: [],
      variants: [
        'required',
        ['essential', 'admin', 'preferences', 'statistics'], // all but chat
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: 'ReactAndShare',
      url: 'https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut',
      actions: [],
      variants: [
        'required',
        ['essential', 'admin', 'preferences', 'statistics'], // all but chat
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: 'PowerBI',
      url: 'https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/asiakkaan-tiedot-ja-oikeudet/odotusajat-ja-asiakaskokemus',
      actions: [],
      variants: [
        'required',
        ['essential', 'admin', 'preferences', 'statistics'], // all but chat
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: 'Cycling Routes',
      url: 'https://www.hel.fi/fi/kaupunkiymparisto-ja-liikenne/pyoraily/pyorareitit',
      skipNetworkIdle: true,
      waitForNetworkIdle: 5000,
      actions: [],
      variants: [
        // 'required',
        ['essential', 'admin', 'preferences', 'statistics'], // all but chat
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: 'kartta.hel.fi',
      url: 'https://www.hel.fi/fi/kaupunkiymparisto-ja-liikenne/kunnossapito/katujen-kunnossapito/katutyot',
      actions: [
        {
          type: 'removeElement',
          selector: '#block-surveys',
        },
        {
          type: 'scrollIntoView',
          selector: '.component__content.map',
        },
        {
          type: 'waitForNetworkIdle',
          timeout: 5000,
        },
      ],
      variants: [
        'required',
        ['essential', 'admin', 'preferences', 'statistics'], // all but chat
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: 'palvelukartta.hel.fi',
      url: 'https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/terveydenhoito/muita-terveyspalveluja/kuntoutus-ja-terapiat/jalkaterapia/munkkiniemen-jalkaterapia',
      actions: [
        {
          type: 'removeElement',
          selector: '#block-surveys',
        },
        {
          type: 'scrollIntoView',
          selector: '.component__content.map',
        },
        {
          type: 'waitForNetworkIdle',
          timeout: 5000,
        },
      ],
      variants: [
        'required',
        ['essential', 'admin', 'preferences', 'statistics'], // all but chat
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: '💬 Sotebot Hester Watson chat inactive',
      url: 'https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/aitiys-ja-lastenneuvolat',
      actions: [],
      variants: [
        'required',
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: '💬 Sotebot Hester Watson chat active',
      url: 'https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/aitiys-ja-lastenneuvolat',
      actions: [
        {
          type: 'removeElement',
          selector: '#block-surveys',
        },
        {
          type: 'click',
          selector: 'button:has-text("Chat")',
        },
      ],
      variants: [
        ['chat'],
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: 'Helfi settings (accordion)',
      url: 'https://www.hel.fi/fi/sosiaali-ja-terveyspalvelut/digitaaliset-palvelut',
      actions: [
        {
          type: 'removeElement',
          selector: '#block-surveys',
        },
        {
          type: 'click',
          selector: 'button:has-text("Avaa kaikki")',
        },
      ],
      variants: [
        'required',
      ],
      ...nodebug,
    },
  ],
};

export {
  config,
};
