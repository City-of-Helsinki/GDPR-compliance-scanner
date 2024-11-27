import fs from 'fs';
import path from 'path';

/**
 * Fetches a list of known tracking domains from blocklistproject.github.io
 * and saves them to a local file
 * @param {Object} timer - Timer instance for performance tracking
 * @returns {Promise<string[]>} Array of tracking domain names
 *   Returns empty array if fetch fails
 * @throws {Error} If directory creation or file writing fails
 */
export async function fetchTrackingDomains(timer) {
  timer.start('Fetching tracking domains');
  let trackingDomains = [];

  try {
    const response = await fetch('https://blocklistproject.github.io/Lists/alt-version/tracking-nl.txt');
    const data = await response.text();

    // Filter out comments and empty lines, trim whitespace
    trackingDomains = data
      .split('\n')
      .filter(line => line && !line.startsWith('#'))
      .map(line => line.trim())
      .filter(line => line.length > 1);

    // Create object with domains and timestamp
    const trackingDomainsData = {
      timeStamp: new Date().toISOString(),
      domains: trackingDomains,
    };

    // Ensure directory exists
    const dir = path.join(process.cwd(), 'reports', 'json');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(
      path.join(dir, 'knownTrackers.json'),
      JSON.stringify(trackingDomainsData, null, 2)
    );

    timer.end('Fetching tracking domains');
    return trackingDomains;

  } catch (error) {
    console.error('Error fetching tracking domains:', error);
    timer.end('Fetching tracking domains');
    return [];
  }
}
