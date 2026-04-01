
// controllers/uploadController.js
// PDF upload, JSON, manual, and Excel uploads are supported.


import multer from 'multer';
import pdfParse from 'pdf-parse';
import Question from '../models/Question.js';
import Quiz from '../models/Quiz.js';
import XLSX from 'xlsx';

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB

const normalizeCorrectIndex = (value) => {
  if (value === null || value === undefined) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  if (/^[1-4]$/.test(raw)) {
    return Number(raw) - 1;
  }

  const letterIndex = ['A', 'B', 'C', 'D'].indexOf(raw.toUpperCase());
  if (letterIndex >= 0) {
    return letterIndex;
  }

  return null;
};

// POST /api/upload/pdf (multipart/form-data, field name "pdf")
export const uploadPdf = [
  upload.single('pdf'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
      const buffer = req.file.buffer;
      const parsed = await pdfParse(buffer);
      const text = parsed.text || '';
      if (!text || text.trim().length < 20) {
        return res.status(400).json({ message: 'Unable to parse PDF or document too short' });
      }

      // Use custom parser for this PDF format
      let extracted = [];
      try {
        extracted = parseQuestionsFromText(text);
      } catch (err) {
        return res.status(500).json({ message: 'Parsing failed', error: err.message });
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
        return res.json({
          data: [],
          warning: 'No questions found. Please add questions manually.'
        });
      }

      return res.json({ data: normalized });
    } catch (err) {
      return res.status(500).json({ message: 'PDF upload failed', error: err.message });
    }
  }
];
      // PDF upload and parsing removed. Only JSON, manual, and Excel uploads are supported.
export const uploadJson = async (req, res) => {
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
export const uploadManual = async (req, res) => {
  try {
    const { quizId, questions } = req.body;

    if (!quizId) {
      return res.status(400).json({ message: 'quizId required' });
    }
    // Validate quizId as a valid ObjectId
    const mongoose = await import('mongoose');
    if (!mongoose.default.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Invalid quizId. Please create/save the quiz first.' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'questions array required' });
    }

    const docs = questions.map((q) => ({
      quizId,
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

// POST /api/upload/excel (multipart/form-data, field name "file")
export const uploadExcel = [
  upload.single('file'),
  async (req, res) => {
    try {
      const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const pick = (r, keys) =>
        keys.map((k) => r[k]).find((v) => v !== undefined && v !== null && String(v).trim() !== '') ?? '';

      const normalized = [];
      const invalidRows = [];

      rows.forEach((r, index) => {
        const text = String(pick(r, ['text', 'question', 'q'])).trim();
        const options = [
          String(pick(r, ['optionA', 'option1', 'a', 'A'])).trim(),
          String(pick(r, ['optionB', 'option2', 'b', 'B'])).trim(),
          String(pick(r, ['optionC', 'option3', 'c', 'C'])).trim(),
          String(pick(r, ['optionD', 'option4', 'd', 'D'])).trim(),
        ];
        const correct = normalizeCorrectIndex(pick(r, ['correct', 'answer', 'ans', 'index']));
        const explanation = String(pick(r, ['explanation', 'explain', 'note'])).trim();

        if (!text) return;

        if (correct === null) {
          invalidRows.push(index + 1);
          return;
        }

        normalized.push({ text, options, correct, explanation });
      });

      if (invalidRows.length > 0) {
        return res.status(400).json({
          message: 'Invalid correct answer format in Excel file. Use 1-4 or A-D only, not 0-3.',
          invalidRows,
        });
      }

      return res.json({ data: normalized });
    } catch (err) {
      console.error('❌ Excel upload error:', err);
      return res.status(500).json({ message: 'Excel upload failed', error: err.message });
    }
  }
];

function parseQuestionsFromText(text) {
  const questionBlocks = text.split(/\n\s*\d+\.\s+/).filter(Boolean);
  const questions = [];

  questionBlocks.forEach(block => {
    // Re-add question number if missing (for first question)
    const lines = block.trim().split('\n').filter(Boolean);
    if (lines.length < 3) return;

    // Question text (may be multi-line)
    let qText = lines[0];
    let i = 1;
    // If question text is multi-line, join until we hit an option
    while (i < lines.length && !lines[i].match(/^A\./)) {
      qText += ' ' + lines[i];
      i++;
    }

    // Options
    const options = [];
    for (let opt = 0; opt < 4 && i < lines.length; opt++, i++) {
      options.push(lines[i].replace(/^[A-D]\.\s*/, '').trim());
    }

    // Correct Answer
    let correct = 0;
    let explanation = '';
    for (; i < lines.length; i++) {
      if (lines[i].startsWith('Correct Answer:')) {
        const ans = lines[i].split(':')[1].trim();
        correct = ['A', 'B', 'C', 'D'].indexOf(ans);
      } else if (lines[i].startsWith('Explanation:')) {
        explanation = lines[i].replace('Explanation:', '').trim();
      }
    }

    questions.push({
      text: qText,
      options,
      correct: correct >= 0 ? correct : 0,
      explanation,
    });
  });

  return questions;
}
