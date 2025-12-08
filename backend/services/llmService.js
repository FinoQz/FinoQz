// services/llmService.js (UPDATED for OpenAI SDK v4+)
const OpenAI = require("openai");

// Ensure API key
if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠ OPENAI_API_KEY is not set — LLM extraction will fail.");
}

// Init OpenAI client (NEW SYNTAX)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// ------------------------------------
// 1. Chunker
// ------------------------------------
function chunkText(text, chunkSize = 6000) {
  if (!text) return [];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let slice = text.slice(start, end);

    if (end < text.length) {
      const extra = text.slice(end, Math.min(end + 200, text.length));
      const newlineIdx = extra.indexOf("\n\n");
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

// ------------------------------------
// 2. Extract JSON from raw LLM text
// ------------------------------------
function extractJSONFromText(text) {
  const first = text.indexOf("[");
  const last = text.lastIndexOf("]");

  if (first >= 0 && last > first) {
    const candidate = text.slice(first, last + 1);

    try {
      return JSON.parse(candidate);
    } catch (err) {
      const cleaned = candidate.replace(/```json|```/g, "");
      try {
        return JSON.parse(cleaned);
      } catch {
        return null;
      }
    }
  }

  return null;
}

// ------------------------------------
// 3. Build System Prompt
// ------------------------------------
function buildPrompt(block) {
  return [
    {
      role: "system",
      content:
        "You are an assistant that MUST return only a valid JSON array of question objects. " +
        "Each question must contain: type (mcq|true-false|short-answer), text, marks. " +
        "For MCQs include options[] and correct (index). Also add confidence (high|medium|low) and status (pending). " +
        "Return ONLY the JSON array with no explanations."
    },
    {
      role: "user",
      content:
        "Extract quiz questions from the following TEXT and return ONLY JSON array:\n\n" +
        "[{\"type\":\"mcq\",\"text\":\"...\",\"options\":[\"A\",\"B\",\"C\"],\"correct\":1,\"marks\":1,\"confidence\":\"high\",\"status\":\"pending\"}]\n\n" +
        `TEXT:\n\n${block}`
    }
  ];
}

// ------------------------------------
// 4. Call OpenAI model (NEW SYNTAX)
// ------------------------------------
async function callModelForChunk(chunk) {
  try {
    const messages = buildPrompt(chunk);

    const resp = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0,
      max_tokens: 4000
    });

    const content = resp?.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = extractJSONFromText(content);
    if (Array.isArray(parsed)) return parsed;

    try {
      const fallback = JSON.parse(content);
      if (Array.isArray(fallback)) return fallback;
    } catch {}

    return null;
  } catch (err) {
    console.error("LLM ERROR:", err?.response?.data || err.message || err);
    return null;
  }
}

// ------------------------------------
// 5. Main Extractor
// ------------------------------------
async function extractQuestionsFromText(fullText) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const chunks = chunkText(fullText, 5000);
  const aggregated = [];

  for (const chunk of chunks) {
    const result = await callModelForChunk(chunk);

    if (Array.isArray(result)) {
      for (const q of result) {
        aggregated.push({
          type: q.type || "mcq",
          text: q.text?.trim() || "",
          options: Array.isArray(q.options)
            ? q.options.map((o) => String(o))
            : undefined,
          correct: typeof q.correct === "number" ? q.correct : q.correct ?? null,
          marks:
            typeof q.marks === "number"
              ? q.marks
              : Number(q.marks) || 1,
          confidence: q.confidence || "medium",
          status: q.status || "pending"
        });
      }
    }

    // small delay to avoid rate limit issues
    await new Promise((r) => setTimeout(r, 250));
  }

  // Deduplicate by normalized text
  const map = new Map();
  for (const q of aggregated) {
    const key = q.text.toLowerCase().trim();
    if (!map.has(key)) map.set(key, q);
  }

  return Array.from(map.values());
}

module.exports = { extractQuestionsFromText };
