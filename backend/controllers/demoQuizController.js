const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const DemoQuizCategory = require('../models/DemoQuizCategory');
const DemoQuizQuestion = require('../models/DemoQuizQuestion');

// Get all categories (admin)
exports.getCategories = async (req, res) => {
  const categories = await DemoQuizCategory.find().sort({ createdAt: -1 });
  res.json(categories);
};

// Create a new category (admin)
exports.createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  const category = await DemoQuizCategory.create({ name });
  res.json(category);
};

// Get questions by category (admin)
exports.getQuestions = async (req, res) => {
  const { categoryId } = req.query;
  if (!categoryId) return res.status(400).json({ error: 'Missing categoryId' });

  const questions = await DemoQuizQuestion.find({ categoryId }).sort({ createdAt: -1 });
  res.json(questions);
};

// Create a new question (admin)
exports.createQuestion = async (req, res) => {
  const { categoryId, question, options, correctIndex } = req.body;
  if (!categoryId || !question || !Array.isArray(options) || correctIndex == null) {
    return res.status(400).json({ error: 'Invalid question payload' });
  }

  const newQuestion = await DemoQuizQuestion.create({
    categoryId,
    question,
    options,
    correctIndex,
  });

  res.json(newQuestion);
};

// Delete a question (admin)
exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  await DemoQuizQuestion.findByIdAndDelete(id);
  res.json({ ok: true });
};



exports.generateAIQuestions = async (req, res) => {
  const { categoryId, prompt, count } = req.body;
  if (!categoryId || !prompt || typeof count !== 'number') {
    return res.status(400).json({ error: 'Invalid AI payload' });
  }

  try {
    const category = await DemoQuizCategory.findById(categoryId);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const chat = model.startChat();
        
    const fullPrompt = `
Generate ${count} multiple-choice questions on the topic "${category.name}".
Each question must have:
- A "question" string
- An "options" array of 4 strings
- A "correctIndex" (0-based index of correct option)

Return ONLY a valid JSON array like:
[
  {
    "question": "What is ...?",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 2
  }
]
Prompt: ${prompt}
`;

    const result = await chat.sendMessage(fullPrompt);
    const response = result.response;
    const text = response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      const match = text.match(/```json\n([\s\S]*?)\n```/);
      if (match) parsed = JSON.parse(match[1]);
      else throw new Error('Failed to parse Gemini response');
    }

    const formatted = parsed.map((q) => ({
      categoryId,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
    }));

    const saved = await DemoQuizQuestion.insertMany(formatted);
    res.json(saved);
  } catch (err) {
    console.error('Gemini quiz generation error:', err);
    res.status(500).json({ error: 'Failed to generate quiz using Gemini' });
  }
};

//
// ✅ PUBLIC ENDPOINTS FOR LANDING PAGE
//

// GET /api/public/demo-quiz/categories
exports.getPublicCategories = async (req, res) => {
  try {
    const categories = await DemoQuizCategory.find().sort({ createdAt: -1 });
    res.json(categories.map(c => ({ _id: c._id, name: c.name })));
  } catch (err) {
    console.error('Public get categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// GET /api/public/demo-quiz/quiz?categoryId=...
exports.getPublicQuizByCategory = async (req, res) => {
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
      })),
    });
  } catch (err) {
    console.error('Public get quiz error:', err);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};
