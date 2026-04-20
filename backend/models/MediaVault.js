import mongoose from 'mongoose';

const mediaVaultSchema = new mongoose.Schema(
  {
    fileHash: {
      type: String,
      required: true,
      unique: true, // SHA-256 fingerprint
      index: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
    },
    originalName: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    contentType: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('MediaVault', mediaVaultSchema);
