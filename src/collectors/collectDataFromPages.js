import { chromium } from 'playwright';
import chalk from 'chalk';
import { collectAllStorageFromPage } from './collectAllStorageFromPage.js';
import { errorLogger } from '../utils/errorLogger.js';


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
        // Ignore errors as not all requests will have security details
        console.log('error', error);
      }

      addDomainToFrame(frame, url, certificateInfo);
    });

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

// Run on a list of URLs concurrently
async function collectDataFromPages(urls, timer) {

  const headResults = await runOnUrlsConcurrently(false, urls, timer);
  const headlessResults = await runOnUrlsConcurrently(true, urls, timer);

  const results = [...headResults, ...headlessResults];

  // Filter out any failed (null) results if necessary
  return results.filter(result => result !== null);
};


export { collectDataFromPages };
