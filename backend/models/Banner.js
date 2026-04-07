import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, required: true }, // The main graphic
    targetUrl: { type: String, default: '' }, // Where clicking the banner takes the user
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false },
  },
  { timestamps: true }
);

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;
