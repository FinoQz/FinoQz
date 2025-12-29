'use strict';

/**
 * LLM extraction service (OpenAI Node v4+)
 *
 * - Exposes: extractQuestionsFromText(fullText)
 * - Uses chat.completions.create to request strictly-formatted JSON from the model.
 * - Robust parsing: tries to find JSON array or object in model output, strips code fences,
 *   and supports a few field name variants (correct / correctIndex / answerIndex).
 *
 * Requirements:
 *  - npm install openai
 *  - set OPENAI_API_KEY and optionally OPENAI_MODEL in env
 *
 * Notes:
 *  - This is a best-effort parser. LLMs can still produce noise — validate results before saving.
 *  - Consider adding retry/backoff and rate-limit handling in production.
 */

const OpenAI = require('openai');
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠ OPENAI_API_KEY is not set — LLM extraction will fail.');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// -----------------------
// Helpers
// -----------------------
function chunkText(text, chunkSize = 6000) {
  if (!text) return [];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);
    let slice = text.slice(start, end);

    // try extend to next double-newline for nicer chunk boundaries if available
    if (end < text.length) {
      const extra = text.slice(end, Math.min(end + 200, text.length));
      const newlineIdx = extra.indexOf('\n\n');
      if (newlineIdx >= 0) {
        slice = text.slice(start, end + newlineIdx + 2);
        start = end + newlineIdx + 2;
      } else {
        start = end;
      }
    } else {
      start = end;
    }

    chunks.push(slice);
  }
  return chunks;
}

// Try to extract JSON (array or object) from model text.
// Will strip common fences and try a few fallback parsing attempts.
function extractJSONFromText(text) {
  if (!text || typeof text !== 'string') return null;

  // Remove common markdown fences
  const cleaned = text.replace(/```(?:json)?/g, '').replace(/`{3,}/g, '').trim();

  // 1) Try direct JSON.parse
  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (_) {}

  // 2) Try to extract first JSON array [...]
  const arrStart = cleaned.indexOf('[');
  const arrEnd = cleaned.lastIndexOf(']');
  if (arrStart >= 0 && arrEnd > arrStart) {
    const candidate = cleaned.slice(arrStart, arrEnd + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {
      // try sanitize trailing commas
      const sanitized = candidate.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
      try {
        return JSON.parse(sanitized);
      } catch (__) {}
    }
  }

  // 3) Try to extract first JSON object { ... }
  const objStart = cleaned.indexOf('{');
  const objEnd = cleaned.lastIndexOf('}');
  if (objStart >= 0 && objEnd > objStart) {
    const candidate = cleaned.slice(objStart, objEnd + 1);
    try {
      const parsed = JSON.parse(candidate);
      // if object contains "questions" array, return that array
      if (parsed && Array.isArray(parsed.questions)) return parsed;
      return parsed;
    } catch (_) {
      const sanitized = candidate.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
      try {
        return JSON.parse(sanitized);
      } catch (__) {}
    }
  }

  return null;
}

// Normalize different possible field names from LLM to a canonical structure
function normalizeQuestionItem(item) {
  if (!item || typeof item !== 'object') return null;

  const text = (item.text || item.question || item.q || '').toString().trim();
  let options = item.options || item.choices || item.answers || [];
  if (!Array.isArray(options)) options = [];

  // Try different names for correct index/value
  let correctIndex = null;
  if (typeof item.correctIndex === 'number') correctIndex = item.correctIndex;
  else if (typeof item.correct === 'number') correctIndex = item.correct;
  else if (typeof item.answerIndex === 'number') correctIndex = item.answerIndex;
  else if (typeof item.correct === 'string') {
    // if correct is string and matches an option, map it
    const idx = options.findIndex((o) => String(o).trim().toLowerCase() === String(item.correct).trim().toLowerCase());
    if (idx >= 0) correctIndex = idx;
  }

  // Ensure options are strings and at least 2 options
  options = options.map((o) => String(o));
  if (options.length < 2) {
    // try to split comma-separated options in item if available
    if (typeof item.options === 'string') {
      options = item.options.split(/\n|,|\|/).map((s) => s.trim()).filter(Boolean);
    }
  }

  // If still insufficient, skip this item
  if (!text || options.length < 2) return null;

  // Normalize correctIndex to valid integer within options range (default 0)
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
    correctIndex = 0;
  }

  return {
    question: text,
    options,
    correctIndex,
    type: item.type || 'mcq',
    marks: Number.isFinite(item.marks) ? Number(item.marks) : 1,
    confidence: item.confidence || 'medium',
    status: item.status || 'pending',
  };
}

// -----------------------
// Model call
// -----------------------
function buildPromptForChunk(chunk) {
  return [
    {
      role: 'system',
      content:
        'You are an assistant that MUST return only valid JSON. Return either a JSON array of question objects or a JSON object with a "questions" array. ' +
        'Each question object must include at least: question (text) and options (array). If possible include correctIndex (0-based), marks (number), type (mcq|true-false|short-answer). ' +
        'DO NOT return any explanatory text, do not include markdown fences — return only JSON.'
    },
    {
      role: 'user',
      content:
        'Extract multiple-choice questions from the following TEXT. Return ONLY JSON (array or object with questions array):\n\n' + chunk
    }
  ];
}

async function callModelForChunk(chunk, model = DEFAULT_MODEL) {
  try {
    const messages = buildPromptForChunk(chunk);
    // new OpenAI JS client: chat.completions.create
    const resp = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.0,
      max_tokens: 1500
    });

    // Support both new-format and fallback text fields
    const content = resp?.choices?.[0]?.message?.content || resp?.choices?.[0]?.text || '';
    if (!content) return null;

    const parsed = extractJSONFromText(content);
    return parsed;
  } catch (err) {
    // surface a concise error to logs
    console.error('LLM call failed:', err?.response?.status, err?.message || err);
    return null;
  }
}

// -----------------------
// Main export
// -----------------------
async function extractQuestionsFromText(fullText, opts = {}) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing');

  const chunkSize = opts.chunkSize || 5000;
  const model = opts.model || DEFAULT_MODEL;
  const numChunks = chunkText(fullText, chunkSize);

  const aggregated = [];
  for (const chunk of numChunks) {
    // call model for each chunk (could be parallelized with care for rate limits)
    const result = await callModelForChunk(chunk, model);
    if (!result) {
      // small pause and continue
      await new Promise((r) => setTimeout(r, 200));
      continue;
    }

    // result might be array or object with questions
    let candidates = [];
    if (Array.isArray(result)) {
      candidates = result;
    } else if (result && Array.isArray(result.questions)) {
      candidates = result.questions;
    } else {
      // not usable
      continue;
    }

    for (const item of candidates) {
      const normalized = normalizeQuestionItem(item);
      if (normalized) aggregated.push(normalized);
    }

    // short delay to reduce chance of hitting rate limits
    await new Promise((r) => setTimeout(r, 250));
  }

  // deduplicate by question text
  const map = new Map();
  for (const q of aggregated) {
    const key = q.question.toLowerCase().trim();
    if (!map.has(key)) map.set(key, q);
  }

  return Array.from(map.values());
}

module.exports = { extractQuestionsFromText };