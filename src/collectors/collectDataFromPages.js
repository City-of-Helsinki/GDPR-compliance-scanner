import { chromium } from 'playwright';
import chalk from 'chalk';
import { collectAllStorageFromPage } from './collectAllStorageFromPage.js';
import { errorLogger } from '../utils/errorLogger.js';

/**
 * Fetches and collects data from a single webpage
 * @param {Browser} browser - Playwright browser instance
 * @param {string} url - URL to fetch data from
 * @param {Array<Object>} [actions=[]] - Array of actions to perform on the page
 * @param {Object} [cookieData=null] - Cookie data to set before loading the page
 * @param {boolean} [pauseForDebug=false] - Whether to pause for debugging
 * @param {boolean} [skipNetworkIdle=false] - Whether to skip waiting for network idle
 * @param {number} [waitForNetworkIdle=5000] - Time to wait for network idle in ms
 * @returns {Promise<Object>} Page data including frames and storage information
 * @throws {Error} If page data collection fails
 */
async function fetchDataFromPage(
  browser,
  url,
  actions = [],
  cookieData = null,
  pauseForDebug = false,
  skipNetworkIdle = false,
  waitForNetworkIdle = 5000,
) {
  let context = null;
  let page = null;

  try {
    context = await browser.newContext();

    // Set cookies before loading the page if provided
    if (cookieData) {
      await context.addCookies(cookieData);
    }

    // Set up the page
    page = await context.newPage();

    // ---
    // Domains
    // ---
    // Store domain information for each frame
    const frameDomains = new Map();

    // Function to add domain and count requests to the frame
    function addDomainToFrame(frame, url, certificateInfo) {
      const domain = new URL(url).hostname;
      if (!frameDomains.has(frame)) {
        frameDomains.set(frame, {});
      }
      const domainCounts = frameDomains.get(frame);
      if (!domainCounts[domain]) {
        domainCounts[domain] = {
          count: 0,
          certificate: certificateInfo,
        };
      }
      domainCounts[domain].count += 1;
    }

    // Listen to all requests and log domains per frame
    page.on('request', async(request) => {
      const frame = request.frame();
      const url = request.url();
      let certificateInfo = null;

      try {
        const securityDetails = await request.headerValue('sec-ch-ua');
        if (!!securityDetails) {
          const response = await request.response();
          if (!!response) {
            const securityInfo = await response.securityDetails();
            if (!!securityInfo) {
              certificateInfo = {
                subjectName: securityInfo.subjectName,
                validFrom: securityInfo.validFrom,
                validTo: securityInfo.validTo,
                issuer: securityInfo.issuer,
                protocol: securityInfo.protocol,
              };
            }
          }
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // These errors are expected to happen when the page/request is no longer available, like when the actions call for a refresh or a new page
      }

      addDomainToFrame(frame, url, certificateInfo);
    });

    // Go to the URL and wait for the page to fully load
    await page.goto(url, { waitUntil: 'load' });

    if (!skipNetworkIdle) {
      // Wait for network idle with a 15 second timeout
      try {
        await Promise.race([
          page.waitForLoadState('networkidle'),
          new Promise(resolve => setTimeout(resolve, 15000))
        ]);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        // If timeout occurs, continue execution
      }

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
    throw error; // Re-throw to be handled by the caller
  } finally {
    // Ensure we clean up resources even if there's an error
    if (context) {
      try {
        await context.close();
      } catch (closeError) {
        errorLogger.logError(`Error closing context for ${url}`, closeError);
      }
    }
  }
}

/**
 * Performs a specific action on a page
 * @param {Page} page - Playwright page object
 * @param {Object} action - Action to perform
 * @param {string} action.type - Type of action ('click', 'type', 'waitForNetworkIdle', etc.)
 * @param {string} [action.selector] - CSS selector for element to act on
 * @param {string} [action.text] - Text to type (for type action)
 * @param {number} [action.timeout] - Timeout for waitForNetworkIdle action
 * @returns {Promise<void>}
 */
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
  } else if (type === 'removeElement') {
    await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.remove();
      }
    }, selector);
  }
}

/**
 * Runs data collection on multiple URLs concurrently with specified headless mode
 * @param {boolean} headlessMode - Whether to run browser in headless mode
 * @param {Array<Object>} urls - Array of URL configurations to process
 * @param {Object} timer - Timer instance for performance tracking
 * @returns {Promise<Array<Object>>} Array of collected data from each URL
 */
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
      errorLogger.logError(`Error in fetchDataFromPage for "${name}" at ${url}`, error);
      console.error(chalk.red(`Error fetching data from "${name}" at ${url}, see logs for more details.`));
      return null; // Return null to indicate failure for this specific URL
    }
  });

  // Wait for all pages to be fetched concurrently
  const results = await Promise.all(fetchPromises);

  // Close the browser
  await browser.close();

  return results.filter(result => result !== null);
}

/**
 * Collects data from multiple pages, running both headless and non-headless modes
 * @param {Array<Object>} urls - Array of URL configurations to process
 * @param {Object} urls[].name - Name identifier for the URL
 * @param {Array} urls[].groups - Groups associated with the URL
 * @param {string} urls[].url - The URL to scan
 * @param {Array} [urls[].actions] - Actions to perform on the page
 * @param {Object} [urls[].cookies] - Cookies to set before loading
 * @param {boolean} [urls[].pause] - Whether to pause for debugging
 * @param {boolean} [urls[].skipNetworkIdle] - Whether to skip network idle wait
 * @param {number} [urls[].waitForNetworkIdle] - Time to wait for network idle
 * @param {Object} timer - Timer instance for performance tracking
 * @returns {Promise<Array<Object>>} Collected data from all pages
 */
async function collectDataFromPages(urls, timer) {

  const headResults = await runOnUrlsConcurrently(false, urls, timer);
  const headlessResults = await runOnUrlsConcurrently(true, urls, timer);

  const results = [...headResults, ...headlessResults];

  // Filter out any failed (null) results if necessary
  return results.filter(result => result !== null);
};


export { collectDataFromPages };
