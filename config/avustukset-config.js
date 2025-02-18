const nodebug = { headless: true, pause: false }
// eslint-disable-next-line no-unused-vars
const debug = { headless: false, pause: true };

const config = {
  name: 'avustukset',
  mainUrl: 'https://avustukset.hel.fi/fi/avustukset',
  apiUrl: 'https://avustukset.hel.fi/en/api/cookie-banner'+'?cacheBuster='+Date.now(),
  settingsDomainSubstitution: 'https://avustukset.hel./fi/avustukset',
  urls: [
    {
      only: false,
      nameBase: 'Frontpage',
      url: 'https://avustukset.hel.fi/fi/avustukset',
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
      url: 'https://avustukset.hel.fi/fi/etsi-avustusta',
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
      url: 'https://avustukset.hel.fi/fi/tietoa-avustuksista/muut-avustukset/hyvinvoinnin-ja-terveyden-edistamisen-seka-sosiaali-terveys-ja-pelastustoimen-avustukset',
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
      url: 'https://avustukset.hel.fi/fi/tietoja-avustuksista/hyteed_yleis/tulosta',
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
      url: 'https://avustukset.hel.fi/fi/ohjeita-hakijalle/palvelun-kayttoohjeet',
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
