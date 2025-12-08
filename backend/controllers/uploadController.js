// controllers/uploadController.js
// Requires: npm i multer pdf-parse
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { extractQuestionsFromText } = require('../services/llmService');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB

// POST /api/upload/pdf  (multipart/form-data, field name "pdf")
exports.uploadPdf = [
  upload.single('pdf'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
      const buffer = req.file.buffer;
      const parsed = await pdfParse(buffer);
      const text = parsed.text || '';
      if (!text || text.trim().length < 20) {
        return res.status(400).json({ message: 'Unable to parse PDF or document too short' });
      }

      // Call LLM to extract questions
      let extracted = [];
      try {
        extracted = await extractQuestionsFromText(text);
      } catch (err) {
        console.error('LLM extraction failed:', err);
      }

      if (!Array.isArray(extracted) || extracted.length === 0) {
        return res.json({
          data: [],
          warning: 'LLM returned no questions. Admin should add questions manually.'
        });
      }

      return res.json({ data: extracted });
    } catch (err) {
      next(err);
    }
  }
];

// POST /api/upload/json  (application/json: { questions: [...] })
exports.uploadJson = async (req, res, next) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions)) return res.status(400).json({ message: 'questions array required' });

    const normalized = questions.map(q => ({
      type: q.type || 'mcq',
      text: String(q.text || '').trim(),
      options: Array.isArray(q.options) ? q.options.map(String) : undefined,
      correct: q.correct ?? null,
      marks: typeof q.marks === 'number' ? q.marks : Number(q.marks) || 1,
      confidence: q.confidence || 'medium',
      status: q.status || 'pending'
    })).filter(q => q.text);

    return res.json({ data: normalized });
  } catch (err) {
    next(err);
  }
};