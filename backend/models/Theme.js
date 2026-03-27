import mongoose from 'mongoose';
const { Schema } = mongoose;

const ThemeSchema = new Schema(
  {
    logoUrl: { type: String, default: '' },
    logoPublicId: { type: String, default: '' },
    primaryColor: { type: String, default: '#253A7B' },
    secondaryColor: { type: String, default: '#1a2a5e' },
    accentColor: { type: String, default: '#3B82F6' },
    backgroundColor: { type: String, default: '#f9fafb' },
    textColor: { type: String, default: '#111827' },
    darkMode: { type: Boolean, default: false },
  },
  {
    collection: 'theme',
    timestamps: true,
  }
);

export default mongoose.models.Theme || mongoose.model('Theme', ThemeSchema);
