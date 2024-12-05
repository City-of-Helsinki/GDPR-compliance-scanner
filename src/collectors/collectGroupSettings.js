/**
 * Strips down a cookie group to essential properties
 * @param {Object} group - The cookie group to strip
 * @param {string} group.groupId - Unique identifier for the group
 * @param {Array<Object>} group.cookies - Array of cookie configurations
 * @param {boolean} required - Whether this is a required cookie group
 * @returns {Object} Stripped group object containing:
 *   - groupId: The group identifier
 *   - required: Boolean indicating if group is required
 *   - cookies: Array of simplified cookie objects
 */
function stripGroup(group, required) {
  return {
    groupId: group.groupId,
    required,
    cookies: group.cookies.map(cookie => ({
      name: cookie.name,
      host: cookie.host,
      storageType: cookie.storageType,
      expiration: typeof cookie.expiration === 'object' ? cookie.expiration.en : cookie.expiration,
    })),
  };
}

/**
 * Fetches and processes cookie consent group settings from a URL
 * @param {string} url - URL to fetch cookie consent settings from
 * @returns {Promise<Object>} Object containing:
 *   - groupSettings: Array of processed cookie groups (both required and optional)
 *   - siteSettings: Raw site settings data
 * @throws {Error} If HTTP request fails or response processing fails
 */
export async function collectGroupSettings(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const siteSettings = await response.json();

    const groupSettings = [
      ...siteSettings.requiredGroups.map(group => stripGroup(group, true)),
      ...siteSettings.optionalGroups.map(group => stripGroup(group, false)),
    ];

    return { groupSettings, siteSettings };
  } catch (error) {
    console.error(`Error fetching consent from url "${url}":`, error);
    throw error;
  }
}
