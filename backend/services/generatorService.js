const axios = require('axios');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Gemini 2.5 Flash Lite endpoint
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

// Helper to call Gemini API
async function geminiPrompt(prompt, maxTokens = 8000) {
  try {
    const res = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens }
      }
    );
    return res.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (err) {
    console.error('Gemini API error:', err?.response?.data || err.message);
    throw new Error('Gemini API error');
  }
}

// Clean Gemini output (remove markdown fences)
function cleanGeminiOutput(output) {
  return output.replace(/```(?:json)?/g, '').replace(/`{3,}/g, '').trim();
}

// Generate quiz description from title
exports.generateDescription = async (quizTitle) => {
  const prompt = `Write a short, engaging, 2-3 line description for a quiz titled "${quizTitle}". Only return the description, nothing else.`;
  return await geminiPrompt(prompt, 480);
};

// Generate quiz questions from prompt, number, topic
exports.generateFromPrompt = async (prompt, numQuestions = 3, topic = '') => {
  const fullPrompt = `
Generate exactly ${numQuestions} multiple-choice questions for a quiz about "${topic}".
Do NOT return less than ${numQuestions} questions. If the content is insufficient, create additional questions based on the topic.
Each question must have: text, options (array), correct (index), explanation (string).
Keep options and explanations short.
Return ONLY valid JSON array, no markdown, no extra text.
Format: [{"text": "...", "options": ["..."], "correct": 0, "explanation": "..."}]
Prompt: ${prompt}
`.trim();
  let output = '';
  let questions = [];
  try {
    output = await geminiPrompt(fullPrompt, 8000);
    const cleaned = cleanGeminiOutput(output);
    // Validate: check if cleaned ends with ']'
    if (!cleaned.endsWith(']')) throw new Error('Gemini output incomplete');
    questions = JSON.parse(cleaned);
  } catch (err) {
    console.error('Gemini output JSON parse error:', err, 'Output:', output);
    questions = [];
  }
  questions = Array.isArray(questions)
    ? questions.map(q => ({
        text: String(q.text || '').trim(),
        options: Array.isArray(q.options) ? q.options.map(String) : ['', '', '', ''],
        correct: typeof q.correct === 'number' ? q.correct : 0,
        explanation: q.explanation ? String(q.explanation) : ''
      }))
    : [];
  // Limit to numQuestions
  if (questions.length > numQuestions) questions = questions.slice(0, numQuestions);
  return { questions };
};

// Chunk text for large files
function chunkText(text, chunkSize = 6000) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize;
  }
  return chunks;
}

// Generate quiz questions from file (PDF/text)
exports.generateFromFile = async (filePath, prompt, numQuestions = 3, topic = '') => {
  let fileText = '';
  try {
    if (filePath.endsWith('.pdf')) {
      const buffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(buffer);
      fileText = parsed.text;
    } else {
      fileText = fs.readFileSync(filePath, 'utf8');
    }
  } catch (err) {
    console.error('File read/parse error:', err);
    throw new Error('File read/parse error');
  }

  const chunks = chunkText(fileText, 6000);
  let allQuestions = [];
  for (const chunk of chunks) {
    const chunkPrompt = `
Extract exactly ${numQuestions} multiple-choice questions (with explanation) from the following content:
${chunk}
If the content is insufficient, create additional questions based on the topic "${topic}".
Return ONLY valid JSON array, no markdown, no extra text.
Format: [{"text": "...", "options": ["..."], "correct": 0, "explanation": "..."}]
`.trim();
    let output = '';
    let questions = [];
    try {
      output = await geminiPrompt(chunkPrompt, 8000);
      questions = JSON.parse(cleanGeminiOutput(output));
    } catch (err) {
      console.error('Gemini output JSON parse error:', err, 'Output:', output);
      questions = [];
    }
    allQuestions = allQuestions.concat(questions);
    if (allQuestions.length >= numQuestions) break;
  }
  // Limit to numQuestions
  if (allQuestions.length > numQuestions) allQuestions = allQuestions.slice(0, numQuestions);
  // Normalize
  allQuestions = Array.isArray(allQuestions)
    ? allQuestions.map(q => ({
        text: String(q.text || '').trim(),
        options: Array.isArray(q.options) ? q.options.map(String) : ['', '', '', ''],
        correct: typeof q.correct === 'number' ? q.correct : 0,
        explanation: q.explanation ? String(q.explanation) : ''
      }))
    : [];
  return { questions: allQuestions };
};

const handleGenerate = async () => {
  setLoading(true);
  try {
    let pdfText = '';
    if (file) {
      // 1. PDF ko backend pe bhejo, text extract karo
      const formData = new FormData();
      formData.append('pdf', file);
      const pdfRes = await apiAdmin.post('/api/upload/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // pdfRes.data.data me questions ya text ho sakta hai
      // Agar sirf text chahiye toh backend ko modify karo ki text bhi bheje
      pdfText = pdfRes.data.text || '';
    }
    // 2. Ab Gemini ko prompt + pdfText bhejo
    const res = await apiAdmin.post('/api/quizzes/admin/generate-questions', {
      prompt: `${prompt}\n\nPDF Content:\n${pdfText}`,
      numQuestions: 10,
      topic: '',
    });
    setQuestions(res.data.data || res.data.questions || []);
  } catch (err) {
    alert('AI generation failed');
  }
  setLoading(false);
};

