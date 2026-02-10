'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

const MONGO_URI = process.env.MONGO_URI;

const CHUNK_SIZE = 500;

const flushBulk = async (model, operations) => {
  if (operations.length === 0) return { modifiedCount: 0 };
  const result = await model.collection.bulkWrite(operations, { ordered: false });
  return result;
};

const run = async () => {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not set.');
  }

  await mongoose.connect(MONGO_URI);

  const quizOps = [];
  const questionOps = [];
  let questionCount = 0;
  let quizUpdateCount = 0;
  let questionUpdateCount = 0;

  const cursor = Question.collection.find({
    $or: [
      { quizId: { $exists: true, $ne: null } },
      { quiz: { $exists: true, $ne: null } }
    ]
  });

  for await (const doc of cursor) {
    const quizIdRaw = doc.quizId || doc.quiz;
    if (!quizIdRaw) continue;

    if (!mongoose.Types.ObjectId.isValid(quizIdRaw)) continue;

    const quizId = new mongoose.Types.ObjectId(quizIdRaw);
    const questionId = doc._id;

    quizOps.push({
      updateOne: {
        filter: { _id: quizId },
        update: { $addToSet: { questions: questionId } }
      }
    });

    if (!doc.quizId && doc.quiz) {
      questionOps.push({
        updateOne: {
          filter: { _id: questionId },
          update: { $set: { quizId } }
        }
      });
    }

    questionCount += 1;

    if (quizOps.length >= CHUNK_SIZE) {
      const result = await flushBulk(Quiz, quizOps.splice(0, quizOps.length));
      quizUpdateCount += result.modifiedCount || 0;
    }

    if (questionOps.length >= CHUNK_SIZE) {
      const result = await flushBulk(Question, questionOps.splice(0, questionOps.length));
      questionUpdateCount += result.modifiedCount || 0;
    }
  }

  if (quizOps.length > 0) {
    const result = await flushBulk(Quiz, quizOps);
    quizUpdateCount += result.modifiedCount || 0;
  }

  if (questionOps.length > 0) {
    const result = await flushBulk(Question, questionOps);
    questionUpdateCount += result.modifiedCount || 0;
  }

  console.log(`Scanned questions: ${questionCount}`);
  console.log(`Updated quizzes: ${quizUpdateCount}`);
  console.log(`Updated questions with quizId: ${questionUpdateCount}`);

  await mongoose.disconnect();
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Backfill failed:', err.message);
    process.exit(1);
  });
