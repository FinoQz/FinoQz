
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LANDING_JSON = path.join(__dirname, '../data/landing.json');


export async function getLanding(req, res) {
  try {
    const data = await fs.readFile(LANDING_JSON, 'utf8');
    const json = JSON.parse(data);
    return res.json(json);
  } catch (err) {
    console.error('getLanding error', err);
    return res.status(500).json({ error: 'Failed to load landing content' });
  }
}


export async function saveLanding(req, res) {
  try {
    const payload = req.body;

    // Load existing data
    let existing = {};
    try {
      const data = await fs.readFile(LANDING_JSON, 'utf8');
      existing = JSON.parse(data);
    } catch (err) {
      // File may not exist yet
    }

    // Merge hero
    payload.hero = {
      ...existing.hero,
      ...payload.hero,
    };

    // Ensure hero object exists
    payload.hero = payload.hero || {};

    // Validate hero.stats
    if (Array.isArray(payload.hero.stats)) {
      payload.hero.stats = payload.hero.stats
        .filter(stat => stat && typeof stat.value === 'string' && typeof stat.label === 'string')
        .slice(0, 3);
    }

    // Validate categories
    if (Array.isArray(payload.categories)) {
      payload.categories = payload.categories
        .filter(cat =>
          typeof cat.id === 'string' &&
          typeof cat.name === 'string' &&
          Array.isArray(cat.bullets)
        )
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          bullets: cat.bullets.filter(b => typeof b === 'string'),
        }));
    }

    // ✅ Validate whyChoose
    if (Array.isArray(payload.reasons)) {
      payload.reasons = payload.reasons
        .filter(r =>
          typeof r.id === 'string' &&
          typeof r.title === 'string' &&
          typeof r.description === 'string'
        );
    }

    // Persist to landing.json
    await fs.mkdir(path.dirname(LANDING_JSON), { recursive: true });
    await fs.writeFile(LANDING_JSON, JSON.stringify(payload, null, 2), 'utf8');

    return res.json({ ok: true });
  } catch (err) {
    console.error('saveLanding error', err);
    return res.status(500).json({ error: 'Failed to save landing content' });
  }
}
