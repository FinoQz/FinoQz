import mongoose from 'mongoose';
import crypto from 'crypto';

const newsletterSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  active: { type: Boolean, default: true },
  unsubscribeToken: { type: String, default: () => crypto.randomUUID() },
}, { timestamps: true });

export default mongoose.model('Newsletter', newsletterSchema);
