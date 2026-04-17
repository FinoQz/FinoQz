import mongoose from 'mongoose';

const forumTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['category', 'action'],
    required: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compound index just in case we need to sort by type, though unique name catches all
forumTagSchema.index({ type: 1, order: 1 });

export default mongoose.model('ForumTag', forumTagSchema);
