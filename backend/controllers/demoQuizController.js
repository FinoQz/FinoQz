import DemoQuizCategory from '../models/DemoQuizCategory.js';
import DemoQuizQuestion from '../models/DemoQuizQuestion.js';
import XLSX from 'xlsx';
import multer from 'multer';
import Groq from 'groq-sdk';

const storage = multer.memoryStorage();
export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

const buildExplanation = (rawExplanation, questionText, options = [], correctIndex = 0) => {
  const trimmed = typeof rawExplanation === 'string' ? rawExplanation.trim() : '';
  if (trimmed) return trimmed;

  const safeIndex = Number.isInteger(correctIndex) ? correctIndex : 0;
  const correctOption = Array.isArray(options) ? String(options[safeIndex] || '').trim() : '';
  if (correctOption) {
    return `The correct answer is \"${correctOption}\" based on the key concept tested in this question.`;
  }

  const fallbackQuestion = typeof questionText === 'string' && questionText.trim()
    ? questionText.trim()
    : 'this question';
  return `This is the correct answer for ${fallbackQuestion} based on core finance concepts.`;
};

// Lazy initialization for Groq (avoid initialization errors at startup)
let groqClient = null;
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

// Get all categories (admin)
export const getCategories = async (req, res) => {
  const categories = await DemoQuizCategory.find().sort({ createdAt: -1 });
  res.json(categories);
};

// Create a new category (admin)
export const createCategory = async (req, res) => {
  const { name, description, bullets, imageUrl } = req.body;
  
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  try {
    const category = await DemoQuizCategory.create({ 
      name, 
      description, 
      bullets: Array.isArray(bullets) ? bullets : [], 
      imageUrl 
    });
    res.json(category);
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Update an existing category (admin)
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, bullets, imageUrl } = req.body;

  try {
    const category = await DemoQuizCategory.findByIdAndUpdate(
      id,
      { 
        name, 
        description, 
        bullets: Array.isArray(bullets) ? bullets : [], 
        imageUrl 
      },
      { new: true }
    );
    
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Delete a category and all its questions (admin)
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await DemoQuizCategory.findById(id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    // Cascading delete questions
    await DemoQuizQuestion.deleteMany({ categoryId: id });
    await DemoQuizCategory.findByIdAndDelete(id);

    res.json({ ok: true, message: 'Category and all related questions deleted' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

// Get questions by category (admin)
export const getQuestions = async (req, res) => {
  const { categoryId } = req.query;
  if (!categoryId) return res.status(400).json({ error: 'Missing categoryId' });

  const questions = await DemoQuizQuestion.find({ categoryId }).sort({ createdAt: -1 });
  res.json(questions);
};

// Create a new question (admin)
export const createQuestion = async (req, res) => {
  const { categoryId, question, options, correctIndex, explanation } = req.body;
  if (!categoryId || !question || !Array.isArray(options) || correctIndex == null) {
    return res.status(400).json({ error: 'Invalid question payload' });
  }

  const normalizedExplanation = buildExplanation(explanation, question, options, correctIndex);

  if (!normalizedExplanation) {
    return res.status(400).json({ error: 'Explanation is required' });
  }

  const newQuestion = await DemoQuizQuestion.create({
    categoryId,
    question,
    options,
    correctIndex,
    explanation: normalizedExplanation,
  });

  res.json(newQuestion);
};

// Update an existing question (admin)
export const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { question, options, correctIndex, explanation } = req.body;

  if (!question || !Array.isArray(options) || correctIndex == null) {
    return res.status(400).json({ error: 'Invalid question payload' });
  }

  const normalizedExplanation = buildExplanation(explanation, question, options, correctIndex);

  if (!normalizedExplanation) {
    return res.status(400).json({ error: 'Explanation is required' });
  }

  try {
    const updatedQuestion = await DemoQuizQuestion.findByIdAndUpdate(
      id,
      {
        question,
        options,
        correctIndex,
        explanation: normalizedExplanation,
      },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    return res.json(updatedQuestion);
  } catch (err) {
    console.error('Update question error:', err);
    return res.status(500).json({ error: 'Failed to update question' });
  }
};

// Delete a question (admin)
export const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  await DemoQuizQuestion.findByIdAndDelete(id);
  res.json({ ok: true });
};


export const generateAIQuestions = async (req, res) => {
  const { categoryId, prompt, count } = req.body;
  if (!categoryId || !prompt || typeof count !== 'number') {
    return res.status(400).json({ error: 'Invalid AI payload' });
  }

  try {
    // Check for Groq API key (preferred)
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ Missing GROQ_API_KEY environment variable');
      return res.status(500).json({ 
        error: 'AI service not configured',
        solution: 'Set GROQ_API_KEY in .env from https://console.groq.com/keys (FREE)',
        benefits: 'Unlimited calls, no rate limits, very fast'
      });
    }

    const category = await DemoQuizCategory.findById(categoryId);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    console.log(`🚀 Using Groq AI (FREE, unlimited calls)`);
    
    const fullPrompt = `You are a quiz generation expert. Generate EXACTLY ${count} high-quality multiple-choice questions on the topic "${category.name}".

Additional context: ${prompt}

IMPORTANT REQUIREMENTS:
- Each question must have exactly 4 options
- Specify which option is correct using correctIndex (0, 1, 2, or 3)
- Include a brief explanation for why the answer is correct
- Return ONLY valid JSON array, nothing else

Return this exact format:
[
  {
    "question": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 2,
    "explanation": "Because..."
  }
]`;

    // Models to try in order (newest to fallback)
    const modelsToTry = [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'gemma-7b-it',
      'mixtral-8x7b-32768',
    ];

    let message = null;
    let lastError = null;
    const groq = getGroqClient();

    for (const modelName of modelsToTry) {
      try {
        console.log(`🔄 Attempting Groq model: ${modelName}`);
        message = await groq.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: fullPrompt,
            },
          ],
          model: modelName,
          temperature: 0.7,
          max_tokens: 2000,
        });
        console.log(`✅ Successfully used model: ${modelName}`);
        break;
      } catch (err) {
        lastError = err;
        console.warn(`⚠️ Model ${modelName} failed:`, err.message);
        continue;
      }
    }

    if (!message) {
      console.error('❌ All Groq models failed:', lastError?.message);
      return res.status(500).json({ 
        error: 'No available Groq models',
        solution: 'Check https://console.groq.com/docs/models for available models',
        details: lastError?.message 
      });
    }

    let responseText = message.choices[0]?.message?.content || '';
    console.log('📝 Groq response received');

    // Clean JSON markdown if present
    if (responseText.startsWith('```json')) {
      responseText = responseText.slice(7, -3).trim();
    } else if (responseText.startsWith('```')) {
      responseText = responseText.slice(3, -3).trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (err) {
      console.error('JSON parse error. Raw text:', responseText);
      return res.status(500).json({ error: 'AI returned invalid JSON format', raw: responseText });
    }

    if (!Array.isArray(parsed)) {
      return res.status(500).json({ error: 'AI did not return an array of questions' });
    }

    const formatted = parsed.slice(0, count).map((q) => ({
      categoryId,
      question: q.question || 'New Question',
      options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['A', 'B', 'C', 'D'],
      correctIndex: typeof q.correctIndex === 'number' ? Math.min(q.correctIndex, 3) : 0,
      explanation: buildExplanation(
        q.explanation,
        q.question || 'New Question',
        Array.isArray(q.options) ? q.options.slice(0, 4) : ['A', 'B', 'C', 'D'],
        typeof q.correctIndex === 'number' ? Math.min(q.correctIndex, 3) : 0
      )
    }));

    const saved = await DemoQuizQuestion.insertMany(formatted);
    console.log(`✅ Generated ${saved.length} questions using Groq`);
    res.json(saved);

  } catch (err) {
    console.error('❌ AI quiz generation error:', err.message);
    
    if (err.message?.includes('API key')) {
      return res.status(500).json({ 
        error: 'Invalid Groq API key',
        solution: 'Get free key from https://console.groq.com/keys',
        details: err.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate quiz using AI',
      solution: 'Check your GROQ_API_KEY in .env file',
      message: err.message 
    });
  }
};

const pickRow = (r, keys) =>
  keys.map((k) => r[k]).find((v) => v !== undefined && v !== null && String(v).trim() !== '') ?? '';

// POST /api/demo-quiz/upload-file
export const uploadQuestionsFile = [
  upload.single('file'),
  async (req, res) => {
    const { categoryId } = req.body;
    if (!categoryId) return res.status(400).json({ error: 'Missing categoryId' });

    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      
      let questions = [];
      const fileName = req.file.originalname.toLowerCase();
      const isExcelOrCsv = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv');

      if (!isExcelOrCsv) {
        return res.status(400).json({ error: 'Unsupported file type. Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed.' });
      }

      if (isExcelOrCsv) {
        const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

        questions = rows.map(r => {
          const mappedQuestion = String(pickRow(r, ['text', 'question', 'q'])).trim();
          const mappedOptions = [
            String(pickRow(r, ['optionA', 'option1', 'a', 'A'])).trim(),
            String(pickRow(r, ['optionB', 'option2', 'b', 'B'])).trim(),
            String(pickRow(r, ['optionC', 'option3', 'c', 'C'])).trim(),
            String(pickRow(r, ['optionD', 'option4', 'd', 'D'])).trim(),
          ];
          const mappedCorrectIndex = Number(pickRow(r, ['correct', 'answer', 'ans', 'index'])) || 0;
          const mappedExplanation = String(pickRow(r, ['explanation', 'explain', 'note'])).trim();

          return {
            question: mappedQuestion,
            options: mappedOptions,
            correctIndex: mappedCorrectIndex,
            explanation: buildExplanation(mappedExplanation, mappedQuestion, mappedOptions, mappedCorrectIndex),
          };
        });
      }

      const filtered = questions.filter(q => q.question && q.options.length === 4 && q.explanation);
      
      if (filtered.length === 0) {
        return res.status(400).json({ error: 'No valid questions found in file' });
      }

      const docs = filtered.map(q => ({
        categoryId,
        ...q
      }));

      const saved = await DemoQuizQuestion.insertMany(docs);
      res.json({ message: `Successfully imported ${saved.length} questions`, data: saved });

    } catch (err) {
      console.error('File upload error:', err);
      res.status(500).json({ error: 'Failed to process file' });
    }
  }
];

//
// ✅ PUBLIC ENDPOINTS FOR LANDING PAGE
//

// GET /api/public/demo-quiz/categories
export const getPublicCategories = async (req, res) => {
  try {
    const categories = await DemoQuizCategory.find().sort({ createdAt: -1 });
    res.json(categories.map(c => ({ 
      _id: c._id, 
      name: c.name,
      description: c.description,
      bullets: c.bullets,
      imageUrl: c.imageUrl
    })));
  } catch (err) {
    console.error('Public get categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// GET /api/public/demo-quiz/quiz?categoryId=...
export const getPublicQuizByCategory = async (req, res) => {
  try {
    const { categoryId } = req.query;
    if (!categoryId) return res.status(400).json({ error: 'Missing categoryId' });

    const category = await DemoQuizCategory.findById(categoryId);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const questions = await DemoQuizQuestion.find({ categoryId }).sort({ createdAt: -1 });

    res.json({
      id: category._id,
      title: category.name,
      questions: questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })),
    });
  } catch (err) {
    console.error('Public get quiz error:', err);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};
