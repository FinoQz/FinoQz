import mongoose from 'mongoose';

const featureSuggestionSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: 'Anonymous' },
  email: { type: String, trim: true },
  suggestion: { type: String, required: true, trim: true, maxlength: 2000 },
  status: { type: String, enum: ['pending', 'reviewed', 'implemented'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('FeatureSuggestion', featureSuggestionSchema);
