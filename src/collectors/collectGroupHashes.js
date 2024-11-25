import { chromium } from 'playwright';
// import { collectCookies } from '../collectors/storages/cookies';

// Collect all groups from a given URL cookie banner
async function collectGroupHashes(url) {

  // Launch the browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Set up the page
  const page = await context.newPage();

  // Go to the URL
  await page.goto(url);

  // Check if page has loaded window.hds.cookieConsent, if it hasn't, wait for it
  await page.waitForFunction('window.hds.cookieConsent');

  // Accept all cookies
  await page.evaluate(() => {
    document.querySelector('.hds-cc__target').shadowRoot.querySelector('.hds-cc__all-cookies-button').click();
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


  // Close context
  await context.close();

  // Close the browser
  await browser.close();

  return { groupHashes, expires };
};


export { collectGroupHashes };
