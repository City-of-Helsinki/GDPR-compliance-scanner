const nodebug = { headless: true, pause: false }
// eslint-disable-next-line no-unused-vars
const debug = { headless: false, pause: true };

const config = {
  name: 'historiaportaali',
  mainUrl: 'https://historia.hel.fi/fi',
  apiUrl: 'https://historia.hel.fi/en/api/cookie-banner'+'?cacheBuster='+Date.now(),
  settingsDomainSubstitution: 'https://historia.hel./fi',
  urls: [
    {
      only: false,
      nameBase: 'Frontpage',
      url: 'https://historia.hel.fi/fi',
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
      url: 'https://historia.hel.fi/fi/haku',
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
      nameBase: 'School register search',
      url: 'https://historia.hel.fi/fi/koulurekisteri',
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
      nameBase: 'School page',
      url: 'https://historia.hel.fi/fi/koulurekisteri/a-kallgrens-handelsskola',
      actions: [],
      variants: [
        'none',
        'required',
        'all',
      ],
      ...nodebug,
    },
  ],
};

export {
  config,
};
