import FeatureSuggestion from '../models/FeatureSuggestion.js';

export const createSuggestion = async (req, res) => {
  try {
    const { name, email, suggestion } = req.body;
    if (!suggestion) {
      return res.status(400).json({ error: 'Suggestion text is required' });
    }
    const newSuggestion = new FeatureSuggestion({ name, email, suggestion });
    await newSuggestion.save();
    res.status(201).json({ message: 'Suggestion submitted successfully', suggestion: newSuggestion });
  } catch (error) {
    console.error('Error creating suggestion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const suggestions = await FeatureSuggestion.find().sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSuggestionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'reviewed', 'implemented'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const updated = await FeatureSuggestion.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Suggestion not found' });
    }
    res.json({ message: 'Status updated', suggestion: updated });
  } catch (error) {
    console.error('Error updating suggestion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    await FeatureSuggestion.findByIdAndDelete(id);
    res.json({ message: 'Suggestion deleted' });
  } catch (error) {
    console.error('Error deleting suggestion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
