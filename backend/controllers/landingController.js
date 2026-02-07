const path = require('path');
const fs = require('fs').promises;
const { saveUploadedFile } = require('../utils/fileStorage');

const LANDING_JSON = path.join(process.cwd(), 'data', 'landing.json');

async function getLanding(req, res) {
  try {
    const raw = await fs.readFile(LANDING_JSON, 'utf8');
    const data = JSON.parse(raw);
    return res.json(data);
  } catch (err) {
    return res.json({});
  }
}

async function saveLanding(req, res) {
  try {
    const payloadText = req.body && req.body.payload;
    if (!payloadText) return res.status(400).json({ error: 'Missing payload form field' });

    let payload;
    try {
      payload = JSON.parse(payloadText);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    // Load existing landing.json if it exists
    let existing = {};
    try {
      const raw = await fs.readFile(LANDING_JSON, 'utf8');
      existing = JSON.parse(raw);
    } catch (_) {
      existing = {};
    }

    // Merge existing with new payload
    payload = {
      ...existing,
      ...payload,
      hero: {
        ...existing.hero,
        ...payload.hero,
      },
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


module.exports = {
  getLanding,
  saveLanding,
};
