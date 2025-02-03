const nodebug = { headless: true, pause: false }
// eslint-disable-next-line no-unused-vars
const debug = { headless: false, pause: true };

const config = {
  name: 'avustukset',
  mainUrl: 'https://avustukset.test.hel.ninja/fi/avustukset',
  apiUrl: 'https://avustukset.test.hel.ninja/en/api/cookie-banner'+'?cacheBuster='+Date.now(),
  settingsDomainSubstitution: 'https://avustukset.test.hel.ninja/fi/avustukset',
  urls: [
    {
      only: false,
      nameBase: 'Frontpage',
      url: 'https://avustukset.test.hel.ninja/fi/avustukset',
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
      url: 'https://avustukset.test.hel.ninja/fi/etsi-avustusta',
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
      nameBase: 'Single grant',
      url: 'https://avustukset.test.hel.ninja/fi/tietoa-avustuksista/muut-avustukset/hyvinvoinnin-ja-terveyden-edistamisen-seka-sosiaali-terveys-ja-pelastustoimen-avustukset',
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
      nameBase: 'Single grant preview',
      url: 'https://avustukset.test.hel.ninja/fi/tietoja-avustuksista/hyteed_yleis/tulosta',
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
      nameBase: 'Accordion',
      url: 'https://avustukset.test.hel.ninja/fi/ohjeita-hakijalle/palvelun-kayttoohjeet',
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
