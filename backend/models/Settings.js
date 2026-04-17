import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  globalChatEnabled: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
