import mongoose from 'mongoose';

const contactQuerySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: ['pending', 'responded', 'archived'], 
    default: 'pending' 
  },
}, { timestamps: true });

export default mongoose.model('ContactQuery', contactQuerySchema);
