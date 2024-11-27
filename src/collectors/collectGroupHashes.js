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
    context = await browser.newContext();

    // Set up the page
    const page = await context.newPage();

    // Go to the URL
    await page.goto(url);

    // Check if page has loaded window.hds.cookieConsent, if it hasn't, wait for it
    await page.waitForFunction('window.hds.cookieConsent');

    // Accept all cookies
    await page.evaluate(() => {
      document
        .querySelector('.hds-cc__target')
        .shadowRoot
        .querySelector('.hds-cc__all-cookies-button')
        .click();
    });

    // Wait for network to be idle after reloading
    await page.waitForLoadState('networkidle');

    // Get "helfi-cookie-consents" cookie from the context
    const cookies = await context.cookies();
    const helfiCookie = cookies.find(cookie => cookie.name === 'helfi-cookie-consents');
    const helfiCookieConsents = helfiCookie ? decodeURIComponent(helfiCookie.value) : null;
    const expires = helfiCookie?.expires;

    if (!helfiCookieConsents) {
      throw new Error('helfi-cookie-consents cookie not found');
    }

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
