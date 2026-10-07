import { chromium } from 'playwright';

/**
 * Collects cookie consent group hashes from a given URL's cookie banner
 * @param {string} url - The URL to collect group hashes from
 * @returns {Promise<Object>} Object containing:
 *   - groupHashes: Object with cookie consent group identifiers
 *   - expires: Expiration timestamp for the consent cookie
 * @throws {Error} If helfi-cookie-consents cookie is not found
 */
async function collectGroupHashes(url) {
  let browser;
  let context;

  try {
    // Launch the browser
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      bypassCSP: true,
    });

    // Set up the page
    const page = await context.newPage();

    // Go to the URL
    await page.goto(url);

    // Wait until the HDS cookie consent component has initialized
    await page.waitForFunction('window.hds.cookieConsent');

    // Accept all cookies
    await page.evaluate(() => {
      document
        .querySelector('.hds-cc__target')
        .shadowRoot
        .querySelector('.hds-cc__all-cookies-button')
        .click();
    });

    // Wait until the cookie consent state has actually been persisted.
    const timeout = 10000;
    const pollInterval = 100;
    const startedAt = Date.now();

    let helfiCookie;
    while (Date.now() - startedAt < timeout) {
      const cookies = await context.cookies();

      helfiCookie = cookies.find(cookie => cookie.name === 'helfi-cookie-consents');
      if (helfiCookie) {
        break;
      }

      await page.waitForTimeout(pollInterval);
    }

    if (!helfiCookie) {
      throw new Error(`helfi-cookie-consents cookie not found after ${timeout}ms`);
    }

    // Decode cookie value
    const helfiCookieConsents = decodeURIComponent(helfiCookie.value);
    const expires = helfiCookie.expires;

    // Parse consent data
    const helfiCookieConsentsObject = JSON.parse(helfiCookieConsents);
    const groupHashes = helfiCookieConsentsObject.groups;

    return { groupHashes, expires };
  } finally {
    // Clean up resources
    if (context) await context.close();
    if (browser) await browser.close();
  }
}

export { collectGroupHashes };
