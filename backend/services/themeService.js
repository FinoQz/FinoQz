import Theme from '../models/Theme.js';

const FINOQZ_DEFAULT_LOGO_URL = 'https://cdn.jsdelivr.net/gh/FinoQz/logo/finoQz.png';
const DEFAULT_PRIMARY_COLOR = '#253A7B';

let _cache = null;
let _cacheAt = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Get current theme logo URL and primary color (with short-lived cache).
 */
export async function getThemeSettings() {
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) return _cache;
  try {
    const theme = await Theme.findOne().lean();
    _cache = {
      logoUrl: theme?.logoUrl || FINOQZ_DEFAULT_LOGO_URL,
      primaryColor: theme?.primaryColor || DEFAULT_PRIMARY_COLOR,
    };
  } catch {
    _cache = { logoUrl: DEFAULT_LOGO_URL, primaryColor: DEFAULT_PRIMARY_COLOR };
  }
  _cacheAt = Date.now();
  return _cache;
}

export function invalidateThemeSettingsCache() {
  _cache = null;
  _cacheAt = 0;
}

/**
 * Replace the hardcoded FinoQz CDN logo URL and primary colour in an email
 * HTML string with the current theme values.
 *
 * @param {string} html - The raw email HTML string
 * @param {{ logoUrl: string, primaryColor: string }} theme
 * @returns {string} HTML with theme values injected
 */
export function injectThemeIntoEmail(html, { logoUrl, primaryColor }) {
  let result = html;

  // Replace logo URL (hardcoded CDN URL → theme logo or keep CDN if empty)
  const logo = logoUrl || FINOQZ_DEFAULT_LOGO_URL;
  result = result.split(FINOQZ_DEFAULT_LOGO_URL).join(logo);

  // Replace primary brand colour (#253A7B) with theme primary colour
  const primary = primaryColor || DEFAULT_PRIMARY_COLOR;
  if (primary !== DEFAULT_PRIMARY_COLOR) {
    result = result.split(DEFAULT_PRIMARY_COLOR).join(primary);
  }

  return result;
}
