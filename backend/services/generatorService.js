import axios from 'axios';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper to call Groq API
async function groqPrompt(prompt, model = 'llama-3.3-70b-versatile') {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: model,
    });
    return chatCompletion.choices[0]?.message?.content || '';
  } catch (err) {
    console.error('Groq API error:', err.message);
    throw new Error('Groq API error');
  }
}

// Clean model output (remove markdown fences)
function cleanModelOutput(output) {
  return output.replace(/```(?:json)?/g, '').replace(/`{3,}/g, '').trim();
}

// Generate quiz description from title
export const generateDescription = async (quizTitle) => {
  const prompt = `Write a short, engaging, 2-3 line description for a quiz titled "${quizTitle}". Only return the description, nothing else.`;
  return await groqPrompt(prompt);
};

// Generate quiz questions from prompt, number, topic
export const generateFromPrompt = async (prompt, numQuestions = 3, topic = '', context = '') => {
  const fullPrompt = `
Generate exactly ${numQuestions} multiple-choice questions for a quiz about "${topic}".
Do NOT return less than ${numQuestions} questions. If the content is insufficient, create additional questions based on the topic.
${context ? `Use the following content as context: ${context.slice(0, 15000)}` : ''}
Each question must have: text, options (array), correct (index), explanation (string).
Use 1-4 or A-D for the correct answer marker in returned data.
Keep options and explanations short.
Return ONLY valid JSON array, no markdown, no extra text.
Format: [{"text": "...", "options": ["..."], "correct": 1, "explanation": "..."}]
Prompt: ${prompt}
`.trim();
  let output = '';
  let questions = [];
  try {
    output = await groqPrompt(fullPrompt);
    const cleaned = cleanModelOutput(output);
    // Validate: check if cleaned ends with ']'
    if (!cleaned.endsWith(']')) throw new Error('Model output incomplete');
    questions = JSON.parse(cleaned);
  } catch (err) {
    console.error('Model output JSON parse error:', err, 'Output:', output);
    questions = [];
  }
  questions = Array.isArray(questions)
    ? questions.map(q => ({
        text: String(q.text || '').trim(),
        options: Array.isArray(q.options) ? q.options.map(String) : ['', '', '', ''],
        correct: typeof q.correct === 'number'
          ? (q.correct >= 1 && q.correct <= 4 ? q.correct - 1 : 0)
          : typeof q.answerLetter === 'string'
            ? ['A', 'B', 'C', 'D'].indexOf(q.answerLetter.trim().toUpperCase())
            : 0,
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
export const generateFromFile = async (filePath, prompt, numQuestions = 3, topic = '') => {
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
Format: [{"text": "...", "options": ["..."], "correct": 1, "explanation": "..."}]
`.trim();
    let output = '';
    let questions = [];
    try {
      output = await groqPrompt(chunkPrompt);
      questions = JSON.parse(cleanModelOutput(output));
    } catch (err) {
      console.error('Model output JSON parse error:', err, 'Output:', output);
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
  // Client side logic placeholder
};


