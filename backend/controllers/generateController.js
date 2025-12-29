const generatorService = require('../services/generatorService');

async function generateFromPrompt(req, res) {
  try {
    const { prompt, numQuestions = 3, topic } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    const result = await generatorService.generateFromPrompt(String(prompt), Number(numQuestions || 3), topic);
    return res.json(result);
  } catch (err) {
    console.error('generateFromPrompt error', err);
    return res.status(500).json({ error: 'Generation failed' });
  }
}

async function generateFromFile(req, res) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'file required' });

    const prompt = req.body.prompt || '';
    const numQuestions = Number(req.body.numQuestions || 3);
    const topic = req.body.topic;

    const result = await generatorService.generateFromFile(file.path, String(prompt), numQuestions, topic);
    return res.json(result);
  } catch (err) {
    console.error('generateFromFile error', err);
    return res.status(500).json({ error: 'File generation failed' });
  }
}

module.exports = {
  generateFromPrompt,
  generateFromFile,
};