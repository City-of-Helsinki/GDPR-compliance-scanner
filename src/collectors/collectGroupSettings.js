function stripGroup(group, required) {
  return {
    groupId: group.groupId,
    required,
    cookies: group.cookies.map(cookie => ({
      name: cookie.name,
      host: cookie.host,
      type: cookie.type,
      expiration: typeof cookie.expiration === 'object' ? cookie.expiration.en : cookie.expiration,
    })),
  };
}

export async function collectGroupSettings(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const siteSettings = await response.json();

    const groupSettings = [
      ...siteSettings.requiredGroups.map(group => (stripGroup(group, true))),
      ...siteSettings.optionalGroups.map(group => (stripGroup(group, false))),
    ]

    return { groupSettings, siteSettings };
  } catch (error) {
    console.error('Error fetching consent:', error);
    throw error;
  }
}
