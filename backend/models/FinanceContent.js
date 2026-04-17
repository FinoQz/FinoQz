import mongoose from 'mongoose';

const financeContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: 500
  },
  // Main content (Markdown/HTML) - Optional: videos/pdf/excel don't have text body
  content: {
    type: String
  },
  thumbnail: {
    type: String,
    trim: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  // New Hierarchical Categories
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinanceCategory',
    required: true,
    index: true
  },
  subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinanceSubcategory',
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Multimodal Types
  type: {
    type: String,
    enum: ['blog', 'video', 'pdf', 'excel', 'article'],
    default: 'blog',
    index: true
  },
  // Type-specific data
  blogData: {
    images: [{ type: String }] // Array for multi-image support
  },
  videoData: {
    url: { type: String, trim: true },
    thumbnail: { type: String, trim: true },
    title: { type: String, trim: true },
    duration: { type: String, trim: true },
    platform: { type: String, default: 'youtube' }
  },
  fileData: {
    url: { type: String, trim: true },
    filename: { type: String, trim: true },
    size: { type: Number }, // In bytes
    mimeType: { type: String }
  },
  // Status & Visibility
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  isVisible: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  // SaaS Analytics
  analytics: {
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 }
  },
  // Track unique views (could be userIds or simple counter with logic in controller)
  uniqueViewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  publishedAt: {
    type: Date
  }
}, { timestamps: true });

// Auto-generate slug from title
financeContentSchema.pre('save', async function (next) {
  if (this.isModified('title')) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 1;
    // Note: This relies on the model being registered. For pre-save on sub-docs use counter differently, 
    // but here it's a top-level model.
    while (await mongoose.models.FinanceContent.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }

  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Compound indexes
financeContentSchema.index({ isPublished: 1, publishedAt: -1 });
financeContentSchema.index({ categoryId: 1, subCategoryId: 1, isPublished: 1 });
financeContentSchema.index({ type: 1, isPublished: 1 });

export default mongoose.models.FinanceContent || mongoose.model('FinanceContent', financeContentSchema);
