import Theme from '../models/Theme.js';
import { invalidateThemeSettingsCache } from '../services/themeService.js';

const DEFAULT_THEME = {
  logoUrl: '',
  logoPublicId: '',
  primaryColor: '#253A7B',
  secondaryColor: '#1a2a5e',
  accentColor: '#3B82F6',
  backgroundColor: '#f9fafb',
  textColor: '#111827',
  darkMode: false,
};

// Simple in-process cache (invalidated on save)
let _cache = null;
let _cacheAt = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

export async function getCachedTheme() {
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) return _cache;
  const theme = await Theme.findOne().lean();
  _cache = theme || DEFAULT_THEME;
  _cacheAt = Date.now();
  return _cache;
}

export function invalidateThemeCache() {
  _cache = null;
  _cacheAt = 0;
}

// Public: get current theme settings
export const getTheme = async (req, res) => {
  try {
    const theme = await getCachedTheme();
    return res.json(theme);
  } catch (err) {
    console.error('getTheme error:', err);
    return res.status(500).json({ message: 'Failed to load theme', error: err.message });
  }
};

// Admin: update theme settings (PATCH)
export const updateTheme = async (req, res) => {
  try {
    const {
      logoUrl,
      logoPublicId,
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      textColor,
      darkMode,
    } = req.body;

    const allowedFields = {
      ...(logoUrl !== undefined && { logoUrl }),
      ...(logoPublicId !== undefined && { logoPublicId }),
      ...(primaryColor !== undefined && { primaryColor }),
      ...(secondaryColor !== undefined && { secondaryColor }),
      ...(accentColor !== undefined && { accentColor }),
      ...(backgroundColor !== undefined && { backgroundColor }),
      ...(textColor !== undefined && { textColor }),
      ...(darkMode !== undefined && { darkMode: Boolean(darkMode) }),
    };

    const theme = await Theme.findOneAndUpdate(
      {},
      { $set: allowedFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    invalidateThemeCache();
    invalidateThemeSettingsCache();
    return res.json({ message: 'Theme updated successfully', theme });
  } catch (err) {
    console.error('updateTheme error:', err);
    return res.status(500).json({ message: 'Failed to update theme', error: err.message });
  }
};
