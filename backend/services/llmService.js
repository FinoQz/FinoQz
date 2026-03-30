'use strict';

const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠ OPENAI_API_KEY is not set — LLM extraction will fail.');
}

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

function extractJSONFromText(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.replace(/```(?:json)?/g, '').replace(/`{3,}/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {}

  const arrStart = cleaned.indexOf('[');
  const arrEnd = cleaned.lastIndexOf(']');
  if (arrStart >= 0 && arrEnd > arrStart) {
    const candidate = cleaned.slice(arrStart, arrEnd + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {
      const sanitized = candidate.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
      try {
        return JSON.parse(sanitized);
      } catch (__) {}
    }
  }

  const objStart = cleaned.indexOf('{');
  const objEnd = cleaned.lastIndexOf('}');
  if (objStart >= 0 && objEnd > objStart) {
    const candidate = cleaned.slice(objStart, objEnd + 1);
    try {
      const parsed = JSON.parse(candidate);
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

function normalizeQuestionItem(item) {
  if (!item || typeof item !== 'object') return null;

  const text = (item.text || item.question || item.q || '').toString().trim();
  let options = item.options || item.choices || item.answers || [];
  if (!Array.isArray(options)) options = [];

  let correctIndex = null;
  if (typeof item.correctIndex === 'number') correctIndex = item.correctIndex;
  else if (typeof item.correct === 'number') correctIndex = item.correct;
  else if (typeof item.answerIndex === 'number') correctIndex = item.answerIndex;
  else if (typeof item.correct === 'string') {
    const idx = options.findIndex((o) => String(o).trim().toLowerCase() === String(item.correct).trim().toLowerCase());
    if (idx >= 0) correctIndex = idx;
  }

  options = options.map((o) => String(o));
  if (options.length < 2) {
    if (typeof item.options === 'string') {
      options = item.options.split(/\n|,|\|/).map((s) => s.trim()).filter(Boolean);
    }
  }
  if (!text || options.length < 2) return null;

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
// Gemini Model Call
// -----------------------
function buildPromptForChunk(chunk) {
  return `
You are an assistant that MUST return only valid JSON. Return either a JSON array of question objects or a JSON object with a "questions" array.
Each question object must include at least: question (text) and options (array). If possible include correctIndex (0-based), marks (number), type (mcq|true-false|short-answer).
DO NOT return any explanatory text, do not include markdown fences — return only JSON.

Extract multiple-choice questions from the following TEXT. Return ONLY JSON (array or object with questions array):

${chunk}
`.trim();
}

async function callGeminiForChunk(chunk) {
  try {
    const prompt = buildPromptForChunk(chunk);
    const res = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1800 }
      }
    );
    const content = res.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!content) return null;
    const parsed = extractJSONFromText(content);
    return parsed;
  } catch (err) {
    console.error('Gemini LLM call failed:', err?.response?.data || err.message);
    return null;
  }
}

// -----------------------
// Main export
// -----------------------
async function extractQuestionsFromText(fullText, opts = {}) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing');

  const chunkSize = opts.chunkSize || 5000;
  const numChunks = chunkText(fullText, chunkSize);

  const aggregated = [];
  for (const chunk of numChunks) {
    const result = await callGeminiForChunk(chunk);
    if (!result) {
      await new Promise((r) => setTimeout(r, 200));
      continue;
    }

    let candidates = [];
    if (Array.isArray(result)) {
      candidates = result;
    } else if (result && Array.isArray(result.questions)) {
      candidates = result.questions;
    } else {
      continue;
    }

    for (const item of candidates) {
      const normalized = normalizeQuestionItem(item);
      if (normalized) aggregated.push(normalized);
    }
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