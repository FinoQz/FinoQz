// controllers/questionController.js
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');

// Create single question and optionally attach to quiz
exports.createQuestion = async (req, res, next) => {
  try {
    const payload = req.body;
    const q = await Question.create({
      type: payload.type || 'mcq',
      text: payload.text,
      options: payload.options,
      correct: payload.correct ?? null,
      marks: payload.marks || 1,
      confidence: payload.confidence || 'medium',
      status: payload.status || 'pending',
      createdBy: req.userId || null
    });

    // Optionally attach to quizId in URL: POST /api/quizzes/:quizId/questions
    if (req.params.quizId) {
      const quizId = req.params.quizId;
      if (mongoose.Types.ObjectId.isValid(quizId)) {
        await Quiz.findByIdAndUpdate(quizId, { $push: { questions: q._id } });
      }
    }

    return res.status(201).json({ message: 'Question created', question: q });
  } catch (err) {
    next(err);
  }
};

exports.bulkCreateAndAttach = async (req, res, next) => {
  // POST /api/quizzes/:quizId/questions  body: { questions: [...], landingDemo: boolean }
  try {
    const { questions = [], landingDemo = false } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'No questions provided' });
    }

    const docs = questions.map(q => ({
      type: q.type || 'mcq',
      text: q.text,
      options: Array.isArray(q.options) ? q.options : undefined,
      correct: q.correct ?? null,
      marks: q.marks || 1,
      confidence: q.confidence || 'medium',
      status: q.status || 'accepted',
      createdBy: req.userId || null
    }));

    const created = await Question.insertMany(docs);
    const ids = created.map(c => c._id);

    const quizId = req.params.quizId;
    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Valid quizId required in path' });
    }

    const quiz = await Quiz.findByIdAndUpdate(quizId, { $push: { questions: { $each: ids } } }, { new: true });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (landingDemo) {
      // Save top 5 demo
      quiz.landingDemoQuestions = (quiz.landingDemoQuestions || []).concat(ids.slice(0, 5));
      await quiz.save();
    }

    return res.status(201).json({ message: 'Imported questions', added: created.length, quiz });
  } catch (err) {
    next(err);
  }
};

exports.getQuestion = async (req, res, next) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    return res.json(q);
  } catch (err) {
    next(err);
  }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    const data = req.body;
    const q = await Question.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!q) return res.status(404).json({ message: 'Question not found' });
    return res.json({ message: 'Question updated', question: q });
  } catch (err) {
    next(err);
  }
};

exports.deleteQuestion = async (req, res, next) => {
  try {
    const q = await Question.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found' });
    // Optionally remove from any quizzes referencing it
    await Quiz.updateMany({ questions: q._id }, { $pull: { questions: q._id } });
    return res.json({ message: 'Question deleted' });
  } catch (err) {
    next(err);
  }
};