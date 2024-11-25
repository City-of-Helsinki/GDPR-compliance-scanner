import { chromium } from 'playwright';
import chalk from 'chalk';
import { collectAllStorageFromPage } from './collectAllStorageFromPage.js';


async function fetchDataFromPage(
  browser,
  url,
  actions = [],
  cookieData = null,
  pauseForDebug = false,
  skipNetworkIdle = false,
  waitForNetworkIdle = 5000,
) {
  try {
    const context = await browser.newContext();

    // Set cookies before loading the page if provided
    if (cookieData) {
      await context.addCookies(cookieData);
    }

    // Set up the page
    const page = await context.newPage();

    // ---
    // Domains
    // ---
    // Store domain information for each frame
    const frameDomains = new Map();

    // Function to add domain and count requests to the frame
    function addDomainToFrame(frame, url) {
      const domain = new URL(url).hostname;
      if (!frameDomains.has(frame)) {
        frameDomains.set(frame, {});
      }
      const domainCounts = frameDomains.get(frame);
      if (!domainCounts[domain]) {
        domainCounts[domain] = 0;
      }
      domainCounts[domain] += 1;
    }

    // Listen to all requests and log domains per frame
    page.on('request', (request) => {
      const frame = request.frame();
      const url = request.url();
      addDomainToFrame(frame, url);
    });
    // ---



    // Go to the URL and wait for the page to fully load
    await page.goto(url, { waitUntil: 'load' });

    if(!skipNetworkIdle) {
      // Wait for network to be idle after loading
      await page.waitForLoadState('networkidle');
    } else {
      // Wait for a little while to make sure network is idle
      await new Promise(resolve => setTimeout(resolve, waitForNetworkIdle));
    }

    // Perform any custom actions on the page if provided
    for (const action of actions) {
      await performAction(page, action);
    }

    // Pause for debugging if the pauseForDebug flag is true
    if (pauseForDebug) {
      // eslint-disable-next-line no-console
      console.log(chalk.cyan("Pausing for debugging. Interact with the browser and press resume in the Playwright Inspector to continue."));
      await page.pause();
    }

    const allFrameData = await collectAllStorageFromPage(context, page, frameDomains);

    await context.close();

    // Return collected data as JSON
    return {
      url,
      frames: allFrameData,
    };
  } catch (error) {
    console.error("Error fetching data from page:", error);
    throw error;
  }
}

// Helper function to perform custom actions
async function performAction(page, action) {
  const { type, selector, text } = action;
  if (type === 'click') {
    await page.click(selector);
  } else if (type === 'type') {
    await page.fill(selector, text);
  } else if (type === 'waitForNetworkIdle') {
    await page.waitForLoadState('networkidle', { timeout: action.timeout });
  } else if (type === 'refresh') {
    await page.reload();
  } else if (type === 'scrollIntoView') {
    await page.evaluate((selector) => {
      document.querySelector(selector).scrollIntoView();
    }, selector);
  }
}

async function runOnUrlsConcurrently(headlessMode, urls, timer) {

  // Launch the browser (set headless to false for debugging)
  const browser = await chromium.launch({ headless: headlessMode });

  const fetchPromises = urls
    .filter(({ headless }) => headless === headlessMode)
    .map(async ({ name, groups, url, actions, cookies, pause, skipNetworkIdle, waitForNetworkIdle }) => {
    try {
      timer.start(` - "${name}"`);
      const result = {
        name,
        groups,
        ...await fetchDataFromPage(
          browser,
          url,
          actions,
          cookies, // Set specific cookies for the URL
          pause,  // If true, pause for debugging
          skipNetworkIdle,
          waitForNetworkIdle
        ),
      };
      timer.end(` - "${name}"`);
      return result;
    } catch (error) {
      console.error(`Failed to fetch data for ${url}:`, error);
      return null; // Return null to indicate failure for this specific URL
    }
  });

  // Wait for all pages to be fetched concurrently
  const results = await Promise.all(fetchPromises);

  // Close the browser
  await browser.close();

  return results.filter(result => result !== null);
}

// Run on a list of URLs concurrently
async function collectDataFromPages(urls, timer) {

  const headResults = await runOnUrlsConcurrently(false, urls, timer);
  const headlessResults = await runOnUrlsConcurrently(true, urls, timer);

  const results = [...headResults, ...headlessResults];

  // Filter out any failed (null) results if necessary
  return results.filter(result => result !== null);
};


export { collectDataFromPages };
