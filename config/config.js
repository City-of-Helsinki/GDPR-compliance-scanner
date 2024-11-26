const nodebug = { headless: true, pause: false }
// eslint-disable-next-line no-unused-vars
const debug = { headless: false, pause: true };

const config = {
  mainUrl: 'https://www.test.hel.ninja/fi/',
  apiUrl: 'https://www.test.hel.ninja/en/api/cookie-banner'+'?cacheBuster='+Date.now(),
  settingsDomainSubstitution: 'https://www.hel.fi/fi/',
  urls: [
    {
      only: false,
      nameBase: 'Frontpage',
      url: 'https://www.test.hel.ninja/fi/',
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
      url: 'https://www.test.hel.ninja/fi/avoimet-tyopaikat',
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
      url: 'https://www.test.hel.ninja/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/kotihoito/liikkumissopimus',
      actions: [],
      variants: [
        'required',
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: 'Helsinkikanava',
      url: 'https://www.test.hel.ninja/fi/sosiaali-ja-terveyspalvelut/senioripalvelut/kotihoito/liikkumissopimus',
      actions: [],
      variants: [
        ['essential', 'admin', 'preferences', 'statistics'], // all but chat
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: 'Youtube',
      url: 'https://www.test.hel.ninja/fi/sosiaali-ja-terveyspalvelut/toihin-meille/toissa-meilla/laakari-tomas-lundqvist-nakee-laaketieteen-koko-kentan',
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
      url: 'https://www.test.hel.ninja/fi/sosiaali-ja-terveyspalvelut',
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
      url: 'https://www.test.hel.ninja/fi/sosiaali-ja-terveyspalvelut/asiakkaan-tiedot-ja-oikeudet/odotusajat-ja-asiakaskokemus',
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
      url: 'https://www.test.hel.ninja/fi/kaupunkiymparisto-ja-liikenne/pyoraily/pyorareitit',
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
      url: 'https://www.test.hel.ninja/fi/kaupunkiymparisto-ja-liikenne/kunnossapito/katujen-kunnossapito/katutyot',
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
      url: 'https://www.test.hel.ninja/fi/sosiaali-ja-terveyspalvelut/terveydenhoito/kuntoutus-ja-terapiat/jalkaterapia/munkkiniemen-jalkaterapia',
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
      nameBase: '💬 Sotebot Hester Watson Genesys chat inactive',
      url: 'https://www.test.hel.ninja/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/aitiys-ja-lastenneuvolat',
      actions: [],
      variants: [
        'required',
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: '💬 Sotebot Hester Watson Genesys chat active',
      url: 'https://www.test.hel.ninja/fi/sosiaali-ja-terveyspalvelut/lasten-ja-perheiden-palvelut/aitiys-ja-lastenneuvolat',
      actions: [
        {
          type: 'removeElement',
          selector: '#block-surveys',
        },
        {
          type: 'click',
          selector: 'button:has-text("Sotebotti Hester")',
        },
      ],
      variants: [
        ['chat'],
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: '💬 Suun terveyden Genesys chat',
      url: 'https://www.test.hel.ninja/fi/sosiaali-ja-terveyspalvelut/terveydenhoito/hammashoito',
      actions: [],
      variants: [
        'required',
        ['chat'],
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: '💬 Helsinki info ACE chat',
      url: 'https://www.test.hel.ninja/fi/',
      actions: [],
      variants: [
        'required',
        ['chat'],
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: '💬 Suun terveyden Genesys chat',
      url: 'https://www.test.hel.ninja/fi/sosiaali-ja-terveyspalvelut/terveydenhoito/hammashoito',
      actions: [
        {
          type: 'removeElement',
          selector: '#block-surveys',
        },
        {
          type: 'click',
          selector: 'button:has-text("Hammashoidon chat")',
        },
        {
          type: 'waitForNetworkIdle',
          timeout: 5000,
        },
        {
          type: 'refresh',
        },
        {
          type: 'waitForNetworkIdle',
          timeout: 5000,
        },
        {
          type: 'click',
          selector: 'button:has-text("Hammashoidon chat")',
        },
        {
          type: 'waitForNetworkIdle',
          timeout: 5000,
        },
      ],
      variants: [
        'none',
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: '💬 Helsinki info ACE chat',
      url: 'https://www.test.hel.ninja/fi/',
      actions: [
        {
          type: 'removeElement',
          selector: '#block-surveys',
        },
        {
          type: 'click',
          selector: 'button:has-text("Kysy kaupungista!")',
        },
        {
          type: 'waitForNetworkIdle',
          timeout: 5000,
        },
      ],
      variants: [
        'none',
      ],
      ...nodebug,
    },
    {
      only: false,
      nameBase: 'Helfi settings (accordion)',
      url: 'https://www.test.hel.ninja/fi/sosiaali-ja-terveyspalvelut/digitaaliset-palvelut',
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
