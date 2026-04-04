'use strict';

const axios = require('axios');

const axios = require('axios');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// -----------------------
// Groq Model Call
// -----------------------
function buildPromptForChunk(chunk) {
  return `
You are an assistant that MUST return only valid JSON. Return either a JSON array of question objects or a JSON object with a "questions" array.
Each question object must include at least: question (text) and options (array). If possible include correctIndex (1-4) or answerLetter (A-D), marks (number), type (mcq|true-false|short-answer).
DO NOT return any explanatory text, do not include markdown fences — return only JSON.

Extract multiple-choice questions from the following TEXT. Return ONLY JSON (array or object with questions array):

${chunk}
`.trim();
}

async function callGroqForChunk(chunk) {
  try {
    const prompt = buildPromptForChunk(chunk);
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
    });
    const content = chatCompletion.choices[0]?.message?.content || '';
    if (!content) return null;
    const parsed = extractJSONFromText(content);
    return parsed;
  } catch (err) {
    console.error('Groq LLM call failed:', err.message);
    return null;
  }
}

// -----------------------
// Main export
// -----------------------
async function extractQuestionsFromText(fullText, opts = {}) {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is missing');

  const chunkSize = opts.chunkSize || 5000;
  const numChunks = chunkText(fullText, chunkSize);

  const aggregated = [];
  for (const chunk of numChunks) {
    const result = await callGroqForChunk(chunk);
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