
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LANDING_JSON = path.join(__dirname, '../data/landing.json');

// Validation helpers
const validateHero = (hero) => {
  if (!hero || typeof hero !== 'object') return null;
  
  return {
    heading: typeof hero.heading === 'string' ? hero.heading.trim() : '',
    tagline: typeof hero.tagline === 'string' ? hero.tagline.trim() : '',
    buttonText: typeof hero.buttonText === 'string' ? hero.buttonText.trim() : '',
    buttonLink: typeof hero.buttonLink === 'string' ? hero.buttonLink.trim() : '',
    imageUrl: typeof hero.imageUrl === 'string' ? hero.imageUrl.trim() : '',
    stats: Array.isArray(hero.stats)
      ? hero.stats
          .filter(stat => 
            stat && 
            typeof stat.value === 'string' && 
            typeof stat.label === 'string' &&
            stat.value.trim() &&
            stat.label.trim()
          )
          .map(stat => ({
            value: stat.value.trim(),
            label: stat.label.trim(),
          }))
          .slice(0, 5) // Max 5 stats
      : [],
  };
};

const validateCategories = (categories) => {
  if (!Array.isArray(categories)) return [];
  
  return categories
    .filter(cat =>
      cat &&
      typeof cat.id === 'string' &&
      typeof cat.name === 'string' &&
      Array.isArray(cat.bullets) &&
      cat.id.trim() &&
      cat.name.trim()
    )
    .map(cat => ({
      id: cat.id.trim(),
      name: cat.name.trim(),
      description: typeof cat.description === 'string' ? cat.description.trim() : '',
      bullets: cat.bullets
        .filter(b => typeof b === 'string' && b.trim())
        .map(b => b.trim())
        .slice(0, 10), // Max 10 bullets per category
    }));
};

const validateReasons = (reasons) => {
  if (!Array.isArray(reasons)) return [];
  
  return reasons
    .filter(r =>
      r &&
      typeof r.id === 'string' &&
      typeof r.title === 'string' &&
      typeof r.description === 'string' &&
      r.id.trim() &&
      r.title.trim() &&
      r.description.trim()
    )
    .map(r => ({
      id: r.id.trim(),
      title: r.title.trim(),
      description: r.description.trim(),
      bullets: Array.isArray(r.bullets)
        ? r.bullets
            .filter(b => typeof b === 'string' && b.trim())
            .map(b => b.trim())
            .slice(0, 10)
        : [],
    }));
};

export async function getLanding(req, res) {
  try {
    const data = await fs.readFile(LANDING_JSON, 'utf8');
    const json = JSON.parse(data);
    return res.json(json);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File doesn't exist, return empty structure
      return res.json({
        hero: {},
        categories: [],
        reasons: [],
      });
    }
    console.error('❌ getLanding error:', err);
    return res.status(500).json({ error: 'Failed to load landing content' });
  }
}

export async function saveLanding(req, res) {
  try {
    const payload = req.body;

    // Validate payload is an object
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid payload: must be an object' });
    }

    // Load existing data
    let existing = {};
    try {
      const data = await fs.readFile(LANDING_JSON, 'utf8');
      existing = JSON.parse(data);
    } catch (err) {
      // File may not exist yet, that's fine
      console.warn('⚠️ No existing landing.json found, creating new');
    }

    // Prepare validated data
    const validated = {
      hero: validateHero(payload.hero || existing.hero),
      categories: validateCategories(payload.categories || existing.categories),
      reasons: validateReasons(payload.reasons || existing.reasons),
    };

    // Ensure directory exists
    await fs.mkdir(path.dirname(LANDING_JSON), { recursive: true });
    
    // Write to file
    await fs.writeFile(
      LANDING_JSON,
      JSON.stringify(validated, null, 2),
      'utf8'
    );

    console.log('✅ Landing content saved successfully');
    return res.json({ ok: true, message: 'Landing content updated successfully' });
  } catch (err) {
    console.error('❌ saveLanding error:', err);
    return res.status(500).json({ error: 'Failed to save landing content' });
  }
}
