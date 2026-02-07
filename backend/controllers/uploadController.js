// controllers/uploadController.js
// Requires: npm i multer pdf-parse

const multer = require('multer');
const pdfParseLib = require('pdf-parse');
const pdfParse = pdfParseLib.default || pdfParseLib; // ✅ This handles both cases!
const { extractQuestionsFromText } = require('../services/llmService');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB

// POST /api/upload/pdf (multipart/form-data, field name "pdf")
exports.uploadPdf = [
  upload.single('pdf'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
      const buffer = req.file.buffer;
      const parsed = await pdfParse(buffer);
      const text = parsed.text || '';
      if (!text || text.trim().length < 20) {
        console.warn('⚠️ PDF too short or empty');
        return res.status(400).json({ message: 'Unable to parse PDF or document too short' });
      }

      let extracted = [];
      try {
        extracted = await extractQuestionsFromText(text);
      } catch (err) {
        console.error('❌ LLM extraction failed:', err);
        return res.status(500).json({ message: 'AI extraction failed', error: err.message });
      }

      const normalized = Array.isArray(extracted)
        ? extracted
            .map((q) => ({
              text: String(q.text || '').trim(),
              options: Array.isArray(q.options) ? q.options.map(String) : ['', '', '', ''],
              correct: typeof q.correct === 'number' ? q.correct : 0,
              explanation: q.explanation ? String(q.explanation) : ''
            }))
            .filter((q) => q.text)
        : [];

      if (normalized.length === 0) {
        console.warn('⚠️ No questions found in PDF');
        return res.json({
          data: [],
          warning: 'No questions found. Please add questions manually.'
        });
      }

      return res.json({ data: normalized, text }); // <-- text bhi bhejo
    } catch (err) {
      console.error('❌ PDF upload error:', err);
      return res.status(500).json({ message: 'PDF upload failed', error: err.message });
    }
  }
];

// POST /api/upload/json (application/json: { questions: [...] })
exports.uploadJson = async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: 'questions array required' });
    }

    const normalized = questions
      .map((q) => ({
        text: String(q.text || '').trim(),
        options: Array.isArray(q.options) ? q.options.map(String) : ['', '', '', ''],
        correct: typeof q.correct === 'number' ? q.correct : 0,
        explanation: q.explanation ? String(q.explanation) : ''
      }))
      .filter((q) => q.text);

    return res.json({ data: normalized });
  } catch (err) {
    console.error('❌ JSON upload error:', err);
    return res.status(500).json({ message: 'JSON upload failed', error: err.message });
  }
};

// POST /api/upload/manual (application/json: { quizId, questions: [...] })
exports.uploadManual = async (req, res) => {
  try {
    const { quizId, questions } = req.body;

    if (!quizId) {
      return res.status(400).json({ message: 'quizId required' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'questions array required' });
    }

    const docs = questions.map((q) => ({
      quiz: quizId,
      text: String(q.text || '').trim(),
      options: Array.isArray(q.options) ? q.options.map(String) : ['', '', '', ''],
      correct: typeof q.correct === 'number' ? q.correct : 0,
      explanation: q.explanation ? String(q.explanation) : ''
    }));

    const saved = await Question.insertMany(docs);

    await Quiz.findByIdAndUpdate(quizId, {
      $push: { questions: { $each: saved.map((q) => q._id) } }
    });

    return res.json({ data: saved });
  } catch (err) {
    console.error('❌ Manual upload error:', err);
    return res.status(500).json({ message: 'Manual upload failed', error: err.message });
  }
};

// Extract exactly ${numQuestions} multiple-choice questions (with explanation) from the following content about "${topic}":
// ${fileText}

// Prompt: ${prompt}
// Return ONLY valid JSON array, no markdown, no extra text. Each item must have: text, options (array), correct (index), explanation (string).
// Format: [{"text": "...", "options": ["..."], "correct": 0, "explanation": "..."}]
